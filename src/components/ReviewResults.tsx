import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Package, Star, ExternalLink } from 'lucide-react';
import { JugadViewerButton } from "@/components/JugadViewerButton";

interface ReviewBackend {
  name: string;
  rating: string;
  title?: string;
  review: string;
  date: string;
  location?: string;
  is_fake?: boolean;              // backend field
  confidence_score?: number;      // backend field
}

interface ReviewResultsProps {
  productTitle: string;
  productImage: string;
  productPrice: string;
  productRating: string;
  platform: string;
  reviews: ReviewBackend[];
  realPercentage: number;         // backend output
  fakePercentage: number;         // backend output
}

export const ReviewResults = ({
  productTitle,
  productImage,
  productPrice,
  productRating,
  platform,
  reviews,
  realPercentage,
  fakePercentage
}: ReviewResultsProps) => {

  // ⭐ Build enriched review objects based on backend authenticity
  const enrichedReviews = reviews.map((r, i) => ({
    id: String(i + 1),
    text: r.review,
    author: r.name || "Anonymous",
    date: r.date || "",
    rating: parseFloat(r.rating) || 0,
    isReal: r.is_fake === false,              // TRUE if backend says NOT fake
    isFake: r.is_fake === true,               // explicit for clarity
    confidence: r.confidence_score ?? 0,
    title: r.title || "",
  }));

  const realReviews = enrichedReviews.filter(r => r.isReal);
  const fakeReviews = enrichedReviews.filter(r => r.isFake);

  const analysisObject = {
    product: {
      title: productTitle,
      image: productImage,
      price: productPrice,
      rating: productRating,
    },
    platform,
    total_reviews: reviews.length,
    fake_count: fakeReviews.length,
    fake_percentage: fakePercentage,
    real_percentage: realPercentage,
    average_confidence:
      enrichedReviews.length
        ? +(enrichedReviews.reduce((a, b) => a + (b.confidence ?? 0), 0) / enrichedReviews.length).toFixed(2)
        : 0,
    reviews: enrichedReviews
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">

      {/* Product Summary */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Product Analysis</h2>

          <Badge variant="secondary" className="ml-auto">
            <ExternalLink className="w-3 h-3 mr-1" />
            {platform}
          </Badge>
        </div>

        <div className="flex gap-6">
          <img
            src={productImage}
            alt={productTitle}
            className="w-24 h-24 rounded-lg object-cover border border-border"
            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
          />

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm mb-2 line-clamp-2">{productTitle}</h3>

            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="text-sm font-medium">{productRating}</span>
              </div>

              <div className="text-lg font-bold text-primary">{productPrice}</div>
            </div>

            <div className="text-xs text-muted-foreground">
              Analyzed {reviews.length} reviews from {platform}
            </div>
          </div>
        </div>
      </Card>

      {/* Authentic vs Fake Summary */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Real Reviews */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-semibold">Authentic Reviews</span>
            </div>

            <div className="text-2xl font-bold text-success">{realPercentage}%</div>
          </div>

          <Progress value={realPercentage} className="h-2 mb-2" />

          <p className="text-sm text-muted-foreground">
            {realReviews.length} out of {enrichedReviews.length} reviews appear genuine
          </p>
        </Card>

        {/* Suspicious Reviews */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              <span className="font-semibold">Suspicious Reviews</span>
            </div>

            <div className="text-2xl font-bold text-destructive">{fakePercentage}%</div>
          </div>

          <Progress value={fakePercentage} className="h-2 mb-2" />

          <p className="text-sm text-muted-foreground">
            {fakeReviews.length} out of {enrichedReviews.length} reviews seem suspicious
          </p>
        </Card>

      </div>

      {/* Review Cards */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Individual Reviews</h3>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {enrichedReviews.map((review) => (
            <div
              key={review.id}
              className={`p-4 rounded-lg border ${
                review.isFake
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-success/5 border-success/20"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col gap-1">

                  <strong className="text-sm">{review.title}</strong>

                  <Badge
                    variant={review.isFake ? "destructive" : "secondary"}
                    className={review.isFake ? "" : "bg-success/10 text-success"}
                  >
                    {review.isFake ? (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        Suspicious
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Authentic
                      </>
                    )}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground">
                  ⭐ {review.rating}
                </div>
              </div>

              <p className="text-sm mb-2">{review.text}</p>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>By {review.author}</span>
                <span>{review.date}</span>
              </div>

              <div className="mt-6 flex justify-end">
                <JugadViewerButton analysis={analysisObject} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
