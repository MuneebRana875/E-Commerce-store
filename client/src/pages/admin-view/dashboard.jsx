import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
// deleteFeatureImage ko import karein
import { addFeatureImage, getFeatureImages, deleteFeatureImage } from "@/store/common-slice"; 
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2 } from "lucide-react"; // Delete icon ke liye

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);

  function handleUploadFeatureImage() {
    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }

  // --- Delete Function ---
  function handleDeleteFeatureImage(id) {
    dispatch(deleteFeatureImage(id)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages()); // List refresh karne ke liye
      }
    });
  }

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div>
      <ProductImageUpload
        imageFile={imageFile}
        setImageFile={setImageFile}
        uploadedImageUrl={uploadedImageUrl}
        setUploadedImageUrl={setUploadedImageUrl}
        setImageLoadingState={setImageLoadingState}
        imageLoadingState={imageLoadingState}
        isCustomStyling={true}
        isEditMode={false}
      />
      <Button 
        onClick={handleUploadFeatureImage} 
        disabled={uploadedImageUrl === ""} // Khali image upload na ho
        className="mt-5 w-full"
      >
        Upload
      </Button>

      <div className="flex flex-col gap-4 mt-5">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((featureImgItem) => (
              <div key={featureImgItem._id} className="relative group">
                <img
                  src={featureImgItem.image}
                  className="w-full h-[300px] object-cover rounded-lg"
                />
                {/* Delete Button Overlay */}
                <div className="absolute top-2 right-2">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteFeatureImage(featureImgItem._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          : null}
      </div>
    </div>
  );
}

export default AdminDashboard;