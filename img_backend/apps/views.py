import io
import traceback
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from PIL import Image

from apps.ml.inference import inpaint
from apps.models import InpaintResult
from django.core.files.base import ContentFile


def home(request):
    return HttpResponse("Image Inpainting backend is running. Use /api/inpaint/ to call the model.")


@csrf_exempt
def inpaint_view(request):
    if request.method != "POST":
        return HttpResponse("Use POST with 'image' and 'mask' files", status=400)

    print("FILES KEYS:", list(request.FILES.keys()))
    print("POST DATA:", request.POST)

    if "image" not in request.FILES or "mask" not in request.FILES:
        return HttpResponse(
            f"Both 'image' and 'mask' must be uploaded. Got: {list(request.FILES.keys())}",
            status=400,
        )

    try:
        img_file = request.FILES["image"]
        mask_file = request.FILES["mask"]
        iterations = int(request.POST.get("iterations", 1))

        # Convert to PIL for model
        img = Image.open(img_file).convert("RGB")
        mask = Image.open(mask_file)

        # Run your GAN
        out_img = inpaint(img, mask, iterations=iterations)

        # Convert output to bytes
        buf = io.BytesIO()
        out_img.save(buf, format="PNG")
        buf.seek(0)

        # ---- SAVE TO DATABASE ----
        result = InpaintResult(
            original_image=img_file,
            mask_image=mask_file,
            iterations=iterations,
        )

        result.result_image.save(
            "inpaint_result.png",
            ContentFile(buf.getvalue()),
            save=False,
        )

        result.save()
        # ---------------------------

        # Return PNG bytes to frontend
        return HttpResponse(buf.getvalue(), content_type="image/png")

    except Exception as e:
        traceback.print_exc()
        return HttpResponse(f"Server error: {str(e)}", status=500)
