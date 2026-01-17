/**
 * Framer Motion Animation Variants
 * Advanced animations untuk Student Documentation UI Enhancement
 */

import { Variants } from 'framer-motion';

// Fade In Animation
export const fadeInVariants: Variants = {
    hidden: { 
        opacity: 0 
    },
    visible: { 
        opacity: 1,
        transition: { 
            duration: 0.3,
            ease: 'easeOut'
        }
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.2
        }
    }
};

// Slide Up Animation
export const slideUpVariants: Variants = {
    hidden: { 
        opacity: 0, 
        y: 20 
    },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
            duration: 0.4, 
            ease: 'easeOut' 
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3
        }
    }
};

// Scale Up Animation
export const scaleUpVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut'
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: 0.2
        }
    }
};

// Stagger Container Animation
export const staggerContainerVariants: Variants = {
    hidden: { 
        opacity: 0 
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

// Stagger Item Animation
export const staggerItemVariants: Variants = {
    hidden: { 
        opacity: 0, 
        y: 20 
    },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: {
            duration: 0.4,
            ease: 'easeOut'
        }
    }
};

// Card Hover Animation
export const cardHoverVariants: Variants = {
    rest: { 
        y: 0,
        scale: 1,
        boxShadow: '0 0 0 rgba(168, 85, 247, 0)',
        transition: {
            duration: 0.3,
            ease: 'easeOut'
        }
    },
    hover: { 
        y: -4,
        scale: 1.02,
        boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)',
        transition: { 
            duration: 0.3,
            ease: 'easeOut'
        }
    }
};

// Modal Animation
export const modalVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.9,
        y: 20
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.68, -0.55, 0.265, 1.55] // Spring easing
        }
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        y: 20,
        transition: {
            duration: 0.3
        }
    }
};

// Backdrop Animation
export const backdropVariants: Variants = {
    hidden: {
        opacity: 0,
        backdropFilter: 'blur(0px)'
    },
    visible: {
        opacity: 1,
        backdropFilter: 'blur(8px)',
        transition: {
            duration: 0.3
        }
    },
    exit: {
        opacity: 0,
        backdropFilter: 'blur(0px)',
        transition: {
            duration: 0.2
        }
    }
};

// Slide In From Right
export const slideInRightVariants: Variants = {
    hidden: {
        opacity: 0,
        x: 100
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: 'easeOut'
        }
    },
    exit: {
        opacity: 0,
        x: 100,
        transition: {
            duration: 0.3
        }
    }
};

// Slide In From Left
export const slideInLeftVariants: Variants = {
    hidden: {
        opacity: 0,
        x: -100
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: 'easeOut'
        }
    },
    exit: {
        opacity: 0,
        x: -100,
        transition: {
            duration: 0.3
        }
    }
};

// Accordion Animation
export const accordionVariants: Variants = {
    collapsed: {
        height: 0,
        opacity: 0,
        transition: {
            duration: 0.3,
            ease: 'easeInOut'
        }
    },
    expanded: {
        height: 'auto',
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: 'easeInOut'
        }
    }
};

// Progress Bar Animation
export const progressBarVariants: Variants = {
    initial: {
        pathLength: 0,
        opacity: 0
    },
    animate: {
        pathLength: 1,
        opacity: 1,
        transition: {
            pathLength: {
                duration: 1,
                ease: 'easeInOut'
            },
            opacity: {
                duration: 0.3
            }
        }
    }
};

// Confetti Animation
export const confettiVariants: Variants = {
    initial: {
        y: 0,
        opacity: 1,
        rotate: 0
    },
    animate: {
        y: '100vh',
        opacity: 0,
        rotate: 720,
        transition: {
            duration: 3,
            ease: 'easeOut'
        }
    }
};

// Spotlight Animation
export const spotlightVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.8
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: 'easeOut'
        }
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        transition: {
            duration: 0.3
        }
    }
};

// Ripple Animation
export const rippleVariants: Variants = {
    initial: {
        scale: 0,
        opacity: 1
    },
    animate: {
        scale: 4,
        opacity: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut'
        }
    }
};

// Notification Slide In
export const notificationVariants: Variants = {
    hidden: {
        opacity: 0,
        y: -50,
        scale: 0.9
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.68, -0.55, 0.265, 1.55]
        }
    },
    exit: {
        opacity: 0,
        x: 100,
        transition: {
            duration: 0.3
        }
    }
};

// Skeleton Shimmer Animation
export const shimmerVariants: Variants = {
    initial: {
        x: '-100%'
    },
    animate: {
        x: '100%',
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
        }
    }
};

// Glow Pulse Animation
export const glowPulseVariants: Variants = {
    initial: {
        opacity: 1,
        filter: 'drop-shadow(0 0 20px currentColor)'
    },
    animate: {
        opacity: [1, 0.6, 1],
        filter: [
            'drop-shadow(0 0 20px currentColor)',
            'drop-shadow(0 0 40px currentColor)',
            'drop-shadow(0 0 20px currentColor)'
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    }
};

// Floating Animation
export const floatingVariants: Variants = {
    initial: {
        y: 0
    },
    animate: {
        y: [-4, 4, -4],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    }
};

// Rotate Animation
export const rotateVariants: Variants = {
    initial: {
        rotate: 0
    },
    animate: {
        rotate: 360,
        transition: {
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
        }
    }
};

// Page Transition Animation
export const pageTransitionVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: 'easeOut'
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3
        }
    }
};

// Bounce Animation
export const bounceVariants: Variants = {
    initial: {
        y: 0
    },
    animate: {
        y: [-4, 0, -4],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    }
};

// Gradient Shift Animation (for backgrounds)
export const gradientShiftVariants: Variants = {
    initial: {
        backgroundPosition: '0% 50%'
    },
    animate: {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        transition: {
            duration: 8,
            repeat: Infinity,
            ease: 'linear'
        }
    }
};

/**
 * Animation Presets
 */
export const animationPresets = {
    fast: { duration: 0.15 },
    normal: { duration: 0.3 },
    slow: { duration: 0.5 },
    smooth: { ease: [0.4, 0, 0.2, 1] },
    spring: { ease: [0.68, -0.55, 0.265, 1.55] }
};

/**
 * Transition Presets
 */
export const transitionPresets = {
    smooth: {
        type: 'tween',
        duration: 0.3,
        ease: 'easeOut'
    },
    spring: {
        type: 'spring',
        stiffness: 300,
        damping: 30
    },
    springBouncy: {
        type: 'spring',
        stiffness: 400,
        damping: 20
    }
};
