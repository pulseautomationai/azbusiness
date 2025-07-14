import React from 'react';

interface ServiceIconProps {
  service: string;
  className?: string;
  size?: number;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ 
  service, 
  className = "", 
  size = 24 
}) => {
  const getIconPath = (serviceName: string) => {
    const normalizedService = serviceName.toLowerCase();
    
    if (normalizedService.includes('hvac') || normalizedService.includes('heating') || normalizedService.includes('cooling')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
          <path d="M12 2L2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-10-5zm6 15h-2v-2h-4v2H8v-6h2v2h4v-2h2v6z"/>
        </svg>
      );
    }
    
    if (normalizedService.includes('plumbing') || normalizedService.includes('pipe')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
          <path d="M18.5 3c-.8 0-1.5.7-1.5 1.5 0 .4.2.8.4 1.1L15 8 8 15l-2.4-2.4c.3-.2.4-.7.4-1.1 0-.8-.7-1.5-1.5-1.5S3 10.7 3 11.5 3.7 13 4.5 13c.4 0 .8-.2 1.1-.4L8 15l-2.4 2.4c-.3-.2-.7-.4-1.1-.4-.8 0-1.5.7-1.5 1.5S3.7 20 4.5 20s1.5-.7 1.5-1.5c0-.4-.2-.8-.4-1.1L8 15l7-7 2.4 2.4c-.3.2-.4.7-.4 1.1 0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5-.7-1.5-1.5-1.5c-.4 0-.8.2-1.1.4L15 8l2.4-2.4c.3.2.7.4 1.1.4.8 0 1.5-.7 1.5-1.5S19.3 3 18.5 3z"/>
        </svg>
      );
    }
    
    if (normalizedService.includes('electrical') || normalizedService.includes('electric')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
          <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"/>
        </svg>
      );
    }
    
    if (normalizedService.includes('landscaping') || normalizedService.includes('garden') || normalizedService.includes('lawn')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
          <path d="M12 2c1.1 0 2 .9 2 2 0 .8-.5 1.5-1.2 1.8.6 1.2 1.2 2.4 1.2 3.7 0 2.2-1.8 4-4 4s-4-1.8-4-4c0-1.3.6-2.5 1.2-3.7C6.5 5.5 6 4.8 6 4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2c0 .8.5 1.5 1.2 1.8-.6 1.2-1.2 2.4-1.2 3.7 0 1.1.9 2 2 2s2-.9 2-2c0-1.3-.6-2.5-1.2-3.7.7-.3 1.2-1 1.2-1.8 0-1.1.9-2 2-2zm5 16H7c-.6 0-1 .4-1 1s.4 1 1 1h10c.6 0 1-.4 1-1s-.4-1-1-1z"/>
        </svg>
      );
    }
    
    if (normalizedService.includes('roofing') || normalizedService.includes('roof')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
          <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 2.7L19 12v6H5v-6l7-6.3z"/>
        </svg>
      );
    }
    
    if (normalizedService.includes('security') || normalizedService.includes('lock')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
        </svg>
      );
    }
    
    if (normalizedService.includes('cleaning') || normalizedService.includes('carpet')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
          <path d="M19.5 12c0-.23-.01-.45-.03-.68l1.86-1.41c.4-.3.51-.86.26-1.3l-1.87-3.23c-.25-.44-.79-.62-1.25-.42l-2.15.91c-.37-.26-.76-.49-1.17-.68l-.29-2.31C14.8 2.38 14.37 2 13.87 2h-3.73c-.5 0-.93.38-.97.88l-.29 2.31c-.41.19-.8.42-1.17.68L5.56 4.96c-.46-.2-1 .02-1.25.42L2.44 8.61c-.25.44-.14 1 .26 1.3l1.86 1.41A7.343 7.343 0 0 0 4.5 12c0 .23.01.45.03.68l-1.86 1.41c-.4.3-.51.86-.26 1.3l1.87 3.23c.25.44.79.62 1.25.42l2.15-.91c.37.26.76.49 1.17.68l.29 2.31c.04.5.47.88.97.88h3.73c.5 0 .93-.38.97-.88l.29-2.31c.41-.19.8-.42 1.17-.68l2.15.91c.46.2 1-.02 1.25-.42l1.87-3.23c.25-.44.14-1-.26-1.3l-1.86-1.41c.02-.23.03-.45.03-.68zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
        </svg>
      );
    }
    
    if (normalizedService.includes('auto') || normalizedService.includes('car') || normalizedService.includes('repair')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      );
    }
    
    if (normalizedService.includes('photography') || normalizedService.includes('photo')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
          <path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z"/>
        </svg>
      );
    }
    
    // Default service icon
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    );
  };

  return getIconPath(service);
};

// Predefined service icons for common categories
export const ServiceIcons = {
  HVAC: (props: Omit<ServiceIconProps, 'service'>) => <ServiceIcon service="hvac" {...props} />,
  Plumbing: (props: Omit<ServiceIconProps, 'service'>) => <ServiceIcon service="plumbing" {...props} />,
  Electrical: (props: Omit<ServiceIconProps, 'service'>) => <ServiceIcon service="electrical" {...props} />,
  Landscaping: (props: Omit<ServiceIconProps, 'service'>) => <ServiceIcon service="landscaping" {...props} />,
  Roofing: (props: Omit<ServiceIconProps, 'service'>) => <ServiceIcon service="roofing" {...props} />,
  Security: (props: Omit<ServiceIconProps, 'service'>) => <ServiceIcon service="security" {...props} />,
  Cleaning: (props: Omit<ServiceIconProps, 'service'>) => <ServiceIcon service="cleaning" {...props} />,
  Auto: (props: Omit<ServiceIconProps, 'service'>) => <ServiceIcon service="auto" {...props} />,
  Photography: (props: Omit<ServiceIconProps, 'service'>) => <ServiceIcon service="photography" {...props} />,
};