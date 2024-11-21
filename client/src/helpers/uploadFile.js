const url = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUND_NAME}/auto/upload`;

const uploadFile = async (file) => {
  const allowedTypes = ["image/", "video/"]; 
  if (!allowedTypes.some((type) => file.type.startsWith(type))) {
    throw new Error("File không hợp lệ! Chỉ chấp nhận hình ảnh hoặc video.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "chat-app-file");

  const response = await fetch(url, {
    method: "post",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload file thất bại!");
  }

  const responseData = await response.json();
  return responseData;
};

export default uploadFile;
