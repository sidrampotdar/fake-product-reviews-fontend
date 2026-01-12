import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Shield, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UrlInputFormProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export const UrlInputForm = ({ onAnalyze, isLoading }: UrlInputFormProps) => {
  const [url, setUrl] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a product URL to analyze",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation - support multiple platforms
    const supportedPlatforms = ['amazon.', 'flipkart.', 'meesho.', 'myntra.', 'ajio.', 'nykaa.'];
    const isSupported = supportedPlatforms.some(platform => url.includes(platform));
    
    if (!isSupported) {
      toast({
        title: "Unsupported Platform",
        description: "Currently supports Amazon, Flipkart, Meesho, Myntra, Ajio, and Nykaa URLs",
        variant: "destructive",
      });
      return;
    }

    onAnalyze(url);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-8 shadow-[var(--shadow-medium)]">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <Shield className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Review Authenticity Detector</h1>
        <p className="text-muted-foreground">
          Analyze product reviews to identify potentially fake reviews using AI
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            Product URL
          </label>
          <Input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.amazon.com/... or flipkart.com/... or meesho.com/..."
            className="h-12"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Supports Amazon, Flipkart, Meesho, Myntra, Ajio, and Nykaa product URLs
          </p>
        </div>
        
        <Button 
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
              Analyzing Reviews...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Analyze Reviews
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-muted-foreground">
        <p>Analysis powered by AI • Results are estimates for educational purposes</p>
      </div>
    </Card>
  );
};