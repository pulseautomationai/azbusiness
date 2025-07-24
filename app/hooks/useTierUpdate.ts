import { useState, useCallback, useEffect } from 'react';
import { TierLevel } from '~/types/tiers';
import { useNavigate } from 'react-router';

interface UseTierUpdateProps {
  businessId: string;
  currentTier: TierLevel;
  onUpdate?: (newTier: TierLevel) => void;
}

export const useTierUpdate = ({ businessId, currentTier, onUpdate }: UseTierUpdateProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleTierChange = useCallback(async (newTier: TierLevel) => {
    if (newTier === currentTier) return;
    
    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      // Simulate API call - in production, this would update the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful update
      console.log(`Business ${businessId} updated from ${currentTier} to ${newTier}`);
      
      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate(newTier);
      }
      
      // Show success notification (you could use a toast library here)
      console.log(`Successfully upgraded to ${newTier}!`);
      
      // Trigger any animations or transitions
      animateTierUpgrade(newTier);
      
    } catch (error) {
      console.error('Tier update failed:', error);
      setUpdateError('Failed to update tier. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [businessId, currentTier, onUpdate]);

  const handleUpgradeClick = useCallback((targetTier: TierLevel) => {
    // Navigate to pricing page with the target tier pre-selected
    navigate(`/pricing?plan=${targetTier}&businessId=${businessId}`);
  }, [navigate, businessId]);

  return {
    handleTierChange,
    handleUpgradeClick,
    isUpdating,
    updateError,
  };
};

// Animation function for tier upgrades
function animateTierUpgrade(newTier: TierLevel) {
  // Add a CSS class temporarily to trigger animations
  document.body.classList.add('tier-upgrading');
  
  // Tier-specific animations
  const tierAnimations: Record<TierLevel, () => void> = {
    free: () => {},
    starter: () => {
      // Blue pulse animation
      document.body.style.setProperty('--upgrade-color', '#3b82f6');
    },
    pro: () => {
      // Orange glow animation
      document.body.style.setProperty('--upgrade-color', '#f97316');
    },
    power: () => {
      // Green celebration animation
      document.body.style.setProperty('--upgrade-color', '#10b981');
      // Could trigger confetti or other celebration effects
    },
  };
  
  tierAnimations[newTier]();
  
  // Remove animation class after animation completes
  setTimeout(() => {
    document.body.classList.remove('tier-upgrading');
  }, 3000);
}