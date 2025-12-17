import gradio as gr
import torch
from diffusers import StableDiffusionPipeline
import os

# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------
# You can change this to any model ID from Hugging Face Hub
MODEL_ID = "runwayml/stable-diffusion-v1-5" 
# If you have a custom model, you can upload it to the directory and point to it.

print(f"Loading model: {MODEL_ID}...")

# ---------------------------------------------------------
# Load Model
# ---------------------------------------------------------
# Use CPU by default for free tier compatibility. 
# If you get a GPU instance, you can change device to "cuda".
device = "cuda" if torch.cuda.is_available() else "cpu"
dtype = torch.float16 if device == "cuda" else torch.float32

try:
    pipe = StableDiffusionPipeline.from_pretrained(
        MODEL_ID, 
        torch_dtype=dtype
    )
    pipe = pipe.to(device)
    # Enable memory efficient attention for lower memory usage
    if device == "cuda":
        pipe.enable_xformers_memory_efficient_attention()
    else:
        # Optimizations for CPU
        pipe.enable_attention_slicing()
        
    print(f"Model loaded successfully on {device}.")
except Exception as e:
    print(f"Error loading model: {e}")
    pipe = None

from deep_translator import GoogleTranslator

# ... (Previous code)

# ---------------------------------------------------------
# Inference Function
# ---------------------------------------------------------
def generate_image(prompt, negative_prompt, steps, guidance_scale):
    if pipe is None:
        return None, "Error: Model not loaded."
    
    try:
        # Translate Japanese to English
        # Simple check: if prompt contains non-ascii, assume it needs translation or just always translate source='auto'
        if prompt:
            print(f"Translating prompt: {prompt}")
            translated_prompt = GoogleTranslator(source='auto', target='en').translate(prompt)
            print(f"Translated: {translated_prompt}")
        else:
            translated_prompt = ""

        image = pipe(
            translated_prompt, 
            negative_prompt=negative_prompt, 
            num_inference_steps=steps, 
            guidance_scale=guidance_scale
        ).images[0]
        return image, "Success"
    except Exception as e:
        return None, f"Error generating image: {e}"

# ---------------------------------------------------------
# GUI Layout
# ---------------------------------------------------------
css = """
body { background-color: #0b0f19; color: white; }
.gradio-container { max-width: 800px !important; margin: auto; padding-top: 20px; }
h1 { color: #f50057; font-family: 'Helvetica Neue', sans-serif; text-align: center; }
"""

with gr.Blocks(css=css, theme=gr.themes.Base()) as demo:
    gr.Markdown("# 🎨 Antigravity AI Generator")
    
    with gr.Row():
        with gr.Column():
            prompt_input = gr.Textbox(label="Prompt", placeholder="Describe your image...", lines=3)
            neg_prompt_input = gr.Textbox(label="Negative Prompt", placeholder="Low quality, ugly...", value="low quality, bad anatomy, worst quality, text, watermark", lines=2)
            
            with gr.Accordion("Advanced Settings", open=False):
                steps_slider = gr.Slider(minimum=10, maximum=50, value=20, step=1, label="Steps (Low=Fast, High=Detailed)")
                cfg_slider = gr.Slider(minimum=1, maximum=20, value=7.5, step=0.5, label="Guidance Scale")
            
            gen_btn = gr.Button("Generate Image", variant="primary")
        
        with gr.Column():
            output_img = gr.Image(label="Result", type="pil")
            status_text = gr.Textbox(label="Status", interactive=False)

    gen_btn.click(
        fn=generate_image,
        inputs=[prompt_input, neg_prompt_input, steps_slider, cfg_slider],
        outputs=[output_img, status_text]
    )

if __name__ == "__main__":
    demo.launch()
