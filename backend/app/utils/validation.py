import io
from fastapi import HTTPException, UploadFile, status
from PIL import Image

from backend.app.config import (
    ALLOWED_IMAGE_FORMATS,
    ALLOWED_MIME_TYPES,
    MAX_FILE_SIZE_BYTES,
    MIN_IMAGE_DIMENSION,
)


async def validate_uploaded_image(file: UploadFile) -> tuple[bytes, Image.Image]:
    """
    Validates an incoming uploaded image file:
    1. Checks MIME type header.
    2. Enforces maximum 10 MB payload size.
    3. Verifies image integrity and decodability using Pillow.
    4. Validates image format and minimum dimensions.

    Returns:
        tuple[bytes, Image.Image]: Raw file bytes and decoded PIL Image.
    """
    # 1. Content-type check
    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported media type '{file.content_type}'. "
                f"Allowed types: {', '.join(sorted(ALLOWED_MIME_TYPES))}"
            ),
        )

    # 2. Read bytes with size enforcement (10 MB limit)
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    if len(contents) > MAX_FILE_SIZE_BYTES:
        max_mb = MAX_FILE_SIZE_BYTES / (1024 * 1024)
        actual_mb = len(contents) / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size ({actual_mb:.2f} MB) exceeds maximum limit of {max_mb:.0f} MB.",
        )

    # 3. Check integrity via PIL verify()
    try:
        verify_stream = io.BytesIO(contents)
        with Image.open(verify_stream) as img_verify:
            img_verify.verify()
            detected_format = img_verify.format
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Corrupted or invalid image file: {str(e)}",
        )

    if detected_format not in ALLOWED_IMAGE_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Detected image format '{detected_format}' is not supported. "
                f"Allowed formats: {', '.join(sorted(ALLOWED_IMAGE_FORMATS))}"
            ),
        )

    # 4. Decode full image and check dimensions
    try:
        load_stream = io.BytesIO(contents)
        image = Image.open(load_stream)
        image.load()  # Force reading pixel data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to decode image data: {str(e)}",
        )

    width, height = image.size
    if width < MIN_IMAGE_DIMENSION or height < MIN_IMAGE_DIMENSION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Image dimensions ({width}x{height}) are too small. "
                f"Minimum required dimension is {MIN_IMAGE_DIMENSION}x{MIN_IMAGE_DIMENSION} pixels."
            ),
        )

    return contents, image
