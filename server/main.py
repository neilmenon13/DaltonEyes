import numpy as np
from PIL import Image
from skimage import color
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app, resources={r"/process-image": {"origins": "*", "methods": ["POST", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

@app.route('/process-image', methods=['POST'])
@cross_origin(origin="*")
def process():
    def rgb_to_lab(img):
        rgb = np.array(img)
        if rgb.shape[2] == 4:
            rgb = rgb[..., :3]
        return color.rgb2lab(rgb)

    def adjust_lab_values(lab_image, deficiency):
        L, A, B = lab_image[:, :, 0], lab_image[:, :, 1], lab_image[:, :, 2]
        L_range = np.max(L) - np.min(L)
        
        L_adjusted = L.copy()
        A_adjusted = A.copy()
        B_adjusted = B.copy()
        
        if deficiency == 'protanopia':
            max_A, min_A = np.max(A), np.min(A)
            A_adjusted = np.where(A > 0, A + (max_A - A) * 0.9, A - (A - min_A) * 0.9)
            max_B, min_B = np.max(B), np.min(B)
            B_adjusted = np.where(B > 0, B + (max_B - B) * -1, B - (B - min_B) * -1)
        elif deficiency == 'deuteranopia':
            
            max_B, min_B = np.max(B), np.min(B)
            B_adjusted = np.where(B > 0, B + (max_B - B) * -.7, B - (B - min_B) * -.7)
            max_A, min_A = np.max(A), np.min(A)
            A_adjusted = np.where(A > 0, A + (max_A - A) * 0.8, A - (A - min_A) * 0.8)
        elif deficiency == 'tritanopia':
            max_L, min_L = np.max(L), np.min(L)
            L_adjusted = np.where(L > 0, L + (max_L - L) * 0.2, L - (L - min_L) * 0.2)
            max_B, min_B = np.max(B), np.min(B)
            B_adjusted = np.where(B > 0, B + (max_B - B) * .7, B - (B - min_B) * .7)
            max_A, min_A = np.max(A), np.min(A)
            A_adjusted = np.where(A > 0, A + (max_A - A) * .9, A - (A - min_A) * .9)
        
        lab_image[:, :, 0] = np.clip(L_adjusted, np.min(L), np.max(L))
        lab_image[:, :, 1] = np.clip(A_adjusted, np.min(A), np.max(A))
        lab_image[:, :, 2] = np.clip(B_adjusted, np.min(B), np.max(B))
        return lab_image

    def gamma_correction(rgb, gamma):
        return np.clip(np.power(rgb, 1/gamma), 0, 1)  

    def remove_undefined_pixels(image, background_color=[0, 0, 0]):
        img_array = np.array(image)
        undefined_pixels = np.all(img_array[0,0,0,255], axis=-1)
        img_array[undefined_pixels, :3] = background_color
        return Image.fromarray(img_array)

    def correct_color_vision(image_path, deficiency):
        original_img = Image.open(image_path)
        original_img = remove_undefined_pixels(original_img)
        lab_image = rgb_to_lab(original_img)
        adjusted_lab_image = adjust_lab_values(lab_image, deficiency)
        adjusted_rgb_image = color.lab2rgb(adjusted_lab_image)
        gamma_value = 2.2
        gamma_corrected_rgb_image = gamma_correction(adjusted_rgb_image, gamma_value)
        final_cvimg = np.array((gamma_corrected_rgb_image * 255).astype(np.uint8))
        return final_cvimg

    data = request.get_json()
    image_path = data['image'] #make so that you can choose file
    deficiency = data['condition']  # take input as protanopia, deuteranopia, or tritanopia
    answer = correct_color_vision(image_path, deficiency)
    cv2.imwrite('output.png', answer)
    return jsonify({'good'})

if __name__ == '__main__':
    app.run(debug=True)