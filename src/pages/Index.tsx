import { useState } from 'react';
import { UrlInputForm } from '@/components/UrlInputForm';
import { ReviewResults } from '@/components/ReviewResults';
import { useToast } from '@/hooks/use-toast';

const detectPlatform = (url: string) => {
  if (url.includes("amazon.")) return "Amazon";
  if (url.includes("flipkart.")) return "Flipkart";
  return "Unknown Platform";
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    productTitle: string;
    productImage: string;
    productPrice: string;
    productRating: string;  // FIXED → string allowed
    platform: string;
    reviews: any[];
    realPercentage: number;
    fakePercentage: number;
  } | null>(null);

  const { toast } = useToast();

  // const handleAnalyze = async (url: string) => {
  //   setIsLoading(true);
  //   setResults(null);

  //   try {
  //     const resp = await fetch("http://127.0.0.1:8000/scrape", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ url }),
  //     });

  //     const json = await resp.json();
  //     console.log("API RESPONSE:", json);   // DEBUG

  //     if (!json.ok) {
  //       throw new Error(json.error || "Scraping failed");
  //     }

  //     const pd = json.product;
  //     const reviews = json.reviews;

  //     // Real/Fake dummy logic (you can integrate AI later)
  //     let realCount = reviews.filter((r: any) => r.isReal).length;
  //     const realPercentage = reviews.length ? Math.round((realCount / reviews.length) * 100) : 0;
  //     const fakePercentage = 100 - realPercentage;

  //     setResults({
  //       productTitle: pd.title || "Unknown Product",
  //       productImage: pd.image || "",
  //       productPrice: pd.price || "",
  //       productRating: pd.rating || "0",
  //       platform: detectPlatform(url),
  //       reviews,
  //       realPercentage,
  //       fakePercentage,
  //     });

  //     toast({
  //       title: "Analysis Complete",
  //       description: `Scraped ${reviews.length} reviews from ${detectPlatform(url)}`
  //     });

  //   } catch (err: any) {
  //     console.error("Scrape error:", err);
  //     toast({
  //       title: "Failed",
  //       description: err.message || "Unknown error"
  //     });
  //   }

  //   setIsLoading(false);
  // };



    const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setResults(null);

    try {
      const resp = await fetch("http://127.0.0.1:8000/api/analyze-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site: detectPlatform(url).toLowerCase(), product_url: url, max_pages: null })
      });

      if (!resp.ok) throw new Error("Network response not ok");
      const json = await resp.json();
      if (!json.ok) throw new Error(json.detail || "Scrape failed");

      // The backend returns fields as defined in app.py
      const productData = json.product || json.product || {};
      const reviews = json.reviews || [];
      const platform = detectPlatform(url);

      // compute real/fake percentages if backend already returned them:
      const realPercentage = json.fake_percentage !== undefined ? 100 - json.fake_percentage : 0;
      const fakePercentage = json.fake_percentage !== undefined ? json.fake_percentage : 0;

      setResults({
        productTitle: productData.title || "Unknown Product",
        productImage: productData.image || "",
        productPrice: productData.price || "",
        productRating: productData.rating || 0,
        platform,
        reviews,
        realPercentage,
        fakePercentage
      });

      toast({
        title: "Analysis Complete",
        description: `Scraped ${json.total_reviews || reviews.length} reviews from ${platform}`,
      });

    } catch (err: any) {
      console.error("Scrape error:", err);
      toast({
        title: "Scrape failed",
        description: err.message || "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8 px-4">
      <div className="container mx-auto">

        {/* URL Input */}
        <div className="mb-8">
          <UrlInputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        {/* ACTUAL SCRAPED RESULTS */}
        {results && (
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            <ReviewResults
              productTitle={results.productTitle}
              productImage={results.productImage}
              productPrice={results.productPrice}
              productRating={results.productRating}
              platform={results.platform}
              reviews={results.reviews}
              realPercentage={results.realPercentage}
              fakePercentage={results.fakePercentage}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default Index;
