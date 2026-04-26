import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);

  const { toast } = useToast();

  function handleRatingChange(getRating) {
    console.log("Rating selected:", getRating);
    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
    setIsSubmitting(false);
  }

  function handleAddReview() {
    console.log("Submit button clicked");
    console.log("Rating value:", rating);
    console.log("Review message:", reviewMsg);
    console.log("Product details:", productDetails);
    console.log("User:", user);
    
    // Validation
    if (rating === 0) {
      console.log("Validation failed: No rating");
      toast({
        title: "Please select a rating",
        description: "You need to rate the product before submitting a review",
        variant: "destructive",
      });
      return;
    }
    
    if (reviewMsg.trim() === "") {
      console.log("Validation failed: Empty review");
      toast({
        title: "Please write a review",
        description: "Review message cannot be empty",
        variant: "destructive",
      });
      return;
    }

    console.log("Validation passed, submitting review...");
    setIsSubmitting(true);
    
    const reviewData = {
      productId: productDetails?._id,
      userId: user?.id,
      userName: user?.userName,
      reviewMessage: reviewMsg,
      reviewValue: rating,
    };
    
    console.log("Review data being sent:", reviewData);
    
    // Dispatch the addReview action
    dispatch(addReview(reviewData))
      .then((data) => {
        console.log("Response from addReview:", data);
        
        if (data?.payload?.success) {
          console.log("Review added successfully");
          // Reset form
          setRating(0);
          setReviewMsg("");
          // Refresh reviews
          dispatch(getReviews(productDetails?._id));
          toast({
            title: "Review added successfully!",
            description: "Thank you for your feedback",
          });
        } else {
          console.log("Review submission failed:", data?.payload);
          toast({
            title: "You already reviewed this product!",
           
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        console.error("Review submission error:", error);
        toast({
          title: "Error",
          description: error?.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        console.log("Setting isSubmitting to false");
        setIsSubmitting(false);
      });
  }

  useEffect(() => {
    if (productDetails !== null) {
      console.log("Fetching reviews for product:", productDetails?._id);
      dispatch(getReviews(productDetails?._id));
    }
  }, [productDetails, dispatch]);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[70vw] max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
        {/* Product Image Section */}
        <div className="relative overflow-hidden rounded-lg w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-full mx-auto lg:mx-0">
          <img
            src={productDetails?.image}
            alt={productDetails?.title}
            width={600}
            height={600}
            className="aspect-square w-full object-cover"
          />
        </div>
        
        {/* Product Details Section */}
        <div className="flex flex-col space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold break-words">
              {productDetails?.title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-2 sm:mt-3 md:mt-4 break-words">
              {productDetails?.description}
            </p>
          </div>
          
          {/* Price Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <p
              className={`text-2xl sm:text-3xl md:text-4xl font-bold text-primary ${
                productDetails?.salePrice > 0 ? "line-through" : ""
              }`}
            >
              ${productDetails?.price}
            </p>
            {productDetails?.salePrice > 0 && (
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-muted-foreground">
                ${productDetails?.salePrice}
              </p>
            )}
          </div>
          
          {/* Rating Section */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-0.5">
              <StarRatingComponent rating={averageReview} />
            </div>
            <span className="text-sm sm:text-base text-muted-foreground">
              ({averageReview.toFixed(2)})
            </span>
          </div>
          
          {/* Add to Cart Button */}
          <div className="mt-2 sm:mt-3 md:mt-4">
            {productDetails?.totalStock === 0 ? (
              <Button className="w-full opacity-60 cursor-not-allowed">
                Out of Stock
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() =>
                  handleAddToCart(
                    productDetails?._id,
                    productDetails?.totalStock
                  )
                }
              >
                Add to Cart
              </Button>
            )}
          </div>
          
          <Separator />
          
          {/* Reviews Section */}
          <div className="flex-1 min-h-0">
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 md:mb-4">
              Reviews ({reviews?.length || 0})
            </h2>
            
            {/* Reviews List */}
            <div className="max-h-[150px] sm:max-h-[200px] md:max-h-[250px] lg:max-h-[300px] overflow-y-auto space-y-3 sm:space-y-4 md:space-y-5 pr-2">
              {reviews && reviews.length > 0 ? (
                reviews.map((reviewItem, index) => (
                  <div key={index} className="flex gap-2 sm:gap-3 md:gap-4">
                    <Avatar className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border flex-shrink-0">
                      <AvatarFallback>
                        {reviewItem?.userName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base break-words">
                          {reviewItem?.userName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-0.5 mt-1">
                        <StarRatingComponent rating={reviewItem?.reviewValue} />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                        {reviewItem.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4 sm:py-6 md:py-8">
                  No reviews yet. Be the first to review!
                </p>
              )}
            </div>
            
            {/* Write Review Section */}
            <div className="mt-4 sm:mt-5 md:mt-6 lg:mt-8 flex flex-col gap-2 sm:gap-3 md:gap-4">
              <Label className="text-sm sm:text-base font-semibold">
                Write a review
              </Label>
              <div className="flex gap-1">
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={handleRatingChange}
                />
              </div>
              <Input
                name="reviewMsg"
                value={reviewMsg}
                onChange={(event) => setReviewMsg(event.target.value)}
                placeholder="Write your review here..."
                className="text-sm sm:text-base"
                disabled={isSubmitting}
              />
              <Button 
                onClick={handleAddReview}
                disabled={isSubmitting || reviewMsg.trim() === "" || rating === 0}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;