from flask import Flask, request, jsonify
import base64
from io import BytesIO
import numpy as np
from PIL import Image
def rgb_to_lab(img):
      rgb = np.array(img)
      if rgb.shape[2] == 4:
          rgb = rgb[..., :3]
      return color.rgb2lab(rgb)

def adjust_lab_values(lab_image, deficiency):
      L, A, B = lab_image[:, :, 0], lab_image[:, :, 1], lab_image[:, :, 2]

      if deficiency == 'protanopia':
          A_adjusted = np.clip(A * 0.9, -128, 128)
          B_adjusted = np.clip(B * -1, -128, 128)
      elif deficiency == 'deuteranopia':
          B_adjusted = np.clip(B * -0.7, -128, 128)
          A_adjusted = np.clip(A * 0.8, -128, 128)
      elif deficiency == 'tritanopia':
          L_adjusted = np.clip(L * 0.2, 0, 100)
          B_adjusted = np.clip(B * 0.7, -128, 128)
          A_adjusted = np.clip(A * 0.9, -128, 128)

      lab_image[:, :, 0] = L_adjusted
      lab_image[:, :, 1] = A_adjusted
      lab_image[:, :, 2] = B_adjusted
      return lab_image

def gamma_correction(rgb, gamma):
      return np.clip(np.power(rgb, 1/gamma), 0, 1)

def remove_undefined_pixels(image, background_color=[0, 0, 0]):
      img_array = np.array(image)
      undefined_pixels = np.all(img_array[..., :3] == 0, axis=-1)
      img_array[undefined_pixels] = background_color
      return Image.fromarray(img_array)

 

app = Flask(__name__)

@app.route('/screenshot', methods=['POST'])
def process_screenshot():
    data = request.json
    deficiency = None

    while deficiency is None:
       try:
          deficiency_data = input("Are you protanopia, deuteranopia, or tritanopia? ").lower()
          if deficiency_data in ['protanopia', 'deuteranopia', 'tritanopia']:
            deficiency = deficiency_data
          else:
            raise ValueError("Please enter either 'protanopia', 'deuteranopia', or 'tritanopia'.")
       except ValueError as e:
        print(e)
    screenshot_data = data.get('screenshotUrl')
    screenshot_data = screenshot_data.split(",")[1]  # Remove 'data:image/png;base64,' prefix
    screenshot_bytes = base64.b64decode(screenshot_data)
    screenshot_image = Image.open(BytesIO(screenshot_bytes))
    image=screenshot_image
    # Apply color correction
    deficiency = 'deuteranopia'  # Take input as protanopia, deuteranopia, or tritanopia
    corrected_image = correct_color_vision(screenshot_image, deficiency)

    # Convert corrected image to base64 string
    buffered = BytesIO()
    corrected_image.save(buffered, format="PNG")
    corrected_image_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return jsonify({"correctedImage": corrected_image_str})

def correct_color_vision(image, deficiency):
    lab_image = rgb_to_lab(image)
    adjusted_lab_image = adjust_lab_values(lab_image, deficiency)
    adjusted_rgb_image = color.lab2rgb(adjusted_lab_image)
    gamma_value = 2.2
    gamma_corrected_rgb_image = gamma_correction(adjusted_rgb_image, gamma_value)
    final_cvimg = np.array((gamma_corrected_rgb_image * 255).astype(np.uint8))
    final_cvimg = Image.fromarray(final_cvimg)
    enhancer = ImageEnhance.Color(final_cvimg)
    final_cvimg = enhancer.enhance(2.1)  # Increase saturation
    enhancer = ImageEnhance.Contrast(final_cvimg)
    final_cvimg = enhancer.enhance(1.1)  # Increase contrast
    return final_cvimg

if __name__ == '__main__':
    app.run(debug=True)
