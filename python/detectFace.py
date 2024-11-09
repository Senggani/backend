import sys
import numpy as np
import cv2

# Read the image data from stdin
image_data = sys.stdin.buffer.read()

# Convert the binary data to a numpy array
nparr = np.frombuffer(image_data, np.uint8)

# Decode the numpy array into an image
image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

if image is not None:
    print("Successfully loaded image from stdin.")
    # You can process the image here, e.g., face detection or image manipulation
else:
    print("Failed to decode image.")