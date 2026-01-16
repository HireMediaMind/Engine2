import { useActiveOffers, Offer, calculateDiscountedPrice, offerAppliesToPlan } from "@/hooks/useOffers";

interface PriceDisplayProps {
  planName: string;
  originalPrice: number;
  priceLabel?: string;
  periodLabel?: string;
  showOfferBadge?: boolean;
}

export const PriceDisplay = ({
  planName,
  originalPrice,
  priceLabel,
  periodLabel = "",
  showOfferBadge = true,
}: PriceDisplayProps) => {
  const { data: offers } = useActiveOffers();

  // Find applicable offer
  const applicableOffer = offers?.find((offer) =>
    offerAppliesToPlan(offer, planName)
  );

  const hasDiscount = applicableOffer && applicableOffer.discount_type !== 'message_only';
  const discountedPrice = hasDiscount
    ? calculateDiscountedPrice(originalPrice, applicableOffer as Offer)
    : originalPrice;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="relative">
      {showOfferBadge && applicableOffer && (
        <span className="absolute -top-6 left-0 inline-flex items-center rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide animate-fade-in">
          {applicableOffer.badge_text}
        </span>
      )}
      <div className="flex items-baseline gap-2">
        {hasDiscount && (
          <span className="text-lg text-muted-foreground line-through">
            {priceLabel || formatPrice(originalPrice)}
          </span>
        )}
        <span className="text-4xl font-bold text-foreground">
          {hasDiscount ? formatPrice(discountedPrice) : (priceLabel || formatPrice(originalPrice))}
        </span>
        {periodLabel && (
          <span className="text-muted-foreground">{periodLabel}</span>
        )}
      </div>
    </div>
  );
};

export const OfferMessage = () => {
  const { data: offers } = useActiveOffers();

  if (!offers?.length) return null;

  const offer = offers[0];

  return (
    <div className="mt-8 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-center animate-fade-in">
      <p className="font-semibold text-accent-foreground">
        {offer.title}
      </p>
      {offer.description && (
        <p className="text-sm text-muted-foreground mt-1">
          {offer.description}
        </p>
      )}
      {offer.end_date && (
        <p className="text-xs text-muted-foreground mt-2">
          Offer valid until {new Date(offer.end_date).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

export const useOfferForPlan = (planName: string) => {
  const { data: offers } = useActiveOffers();
  return offers?.find((offer) => offerAppliesToPlan(offer, planName));
};
