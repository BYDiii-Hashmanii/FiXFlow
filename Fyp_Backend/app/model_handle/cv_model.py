# from ultralytics import YOLO
# from pathlib import Path

# MODEL_PATH = "./fixFlow_Model_cv/FixFlow_Training_Final_model/FixFlow_YOLO11s_v2/weights/best.pt"
# # D:\Fyp_Backend\model_handle\fixFlow_Model_cv\FixFlow_Training_Final_model\FixFlow_YOLO11s_v2\weights\best.pt
# # Load model
# model = YOLO(MODEL_PATH)

# if model:
#   print("Model loaded successfully!")


# /////////////////////////////////////////////// ................ /////////////////

# import streamlit as st
# from ultralytics import YOLO
# from PIL import Image

# # Load model
# MODEL_PATH = "./fixFlow_Model_cv/FixFlow_Training_Final_model/FixFlow_YOLO11s_v2/weights/best.pt"

# model = YOLO(MODEL_PATH)

# st.title("FixFlow - Object Detection")
# st.write("Upload an image to detect objects.")

# # Upload image
# uploaded_file = st.file_uploader(
#     "Choose an Image",
#     type=["jpg", "jpeg", "png"]
# )

# if uploaded_file:
#     image = Image.open(uploaded_file)

#     st.image(image, caption="Uploaded Image", use_container_width=True)

#     if st.button("Predict"):
#         results = model.predict(image)

#         # Display prediction
#         result_image = results[0].plot()

#         st.subheader("Prediction Result")
#         st.image(result_image, channels="BGR", use_container_width=True)

#         # Display detected classes
#         st.subheader("Detected Objects")

#         for box in results[0].boxes:
#             class_id = int(box.cls[0])
#             confidence = float(box.conf[0])

#             class_name = model.names[class_id]

#             st.write(
#                 f"{class_name} - Confidence: {confidence:.2f}"
#             )

# ....................................................................


import streamlit as st
from ultralytics import YOLO
from PIL import Image

# Model path
MODEL_PATH = "./fixFlow_Model_cv/FixFlow_Training_Final_model/FixFlow_YOLO11s_v2/weights/best.pt"

# Load model
@st.cache_resource
def load_model():
    return YOLO(MODEL_PATH)

model = load_model()

st.title("FixFlow - Object Detection")
st.write("Upload an image to detect objects.")

# Upload image
uploaded_file = st.file_uploader(
    "Choose an Image",
    type=["jpg", "jpeg", "png", "jfif"]
)

if uploaded_file:

    # Open image and convert to RGB
    image = Image.open(uploaded_file).convert("RGB")

    st.image(
        image,
        caption="Uploaded Image",
        use_container_width=True
    )

    # Prediction button
    if st.button("Predict"):

        with st.spinner("Predicting..."):

            # Run YOLO prediction
            results = model.predict(image)

            # Get annotated image
            result_image = results[0].plot()

        st.subheader("Prediction Result")

        st.image(
            result_image,
            channels="BGR",
            use_container_width=True
        )

        # Display detected objects
        st.subheader("Detected Objects")

        if len(results[0].boxes) > 0:

            for box in results[0].boxes:

                class_id = int(box.cls[0])
                confidence = float(box.conf[0])

                class_name = model.names[class_id]

                st.write(
                    f"{class_name} - Confidence: {confidence:.2f}"
                )

        else:
            st.write("No objects detected.")
