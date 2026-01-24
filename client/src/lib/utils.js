import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export const createPageUrl = (pageName) => {
    switch (pageName) {
        case 'Home': return '/';
        case 'Dashboard': return '/dashboard';
        case 'Marketplace': return '/marketplace';
        case 'InvestmentGoals': return '/investment-goals';
        case 'ListOpportunity': return '/list-opportunity';
        case 'ListingDetails': return '/listing-details';
        case 'KYCVerification': return '/kyc-verification';
        case 'Portfolio': return '/portfolio';
        case 'ProfileSettings': return '/profile-settings';
        case 'MyFavorites': return '/my-favorites';
        case 'Messages': return '/messages';
        default: return '/';
    }
};
