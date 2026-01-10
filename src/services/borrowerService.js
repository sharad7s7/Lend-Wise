import { borrowRequestService } from './borrowRequestService';

export const borrowerService = {
  // Available borrowers for lenders to invest in
  // Now proxies to borrowRequestService.getAllRequests
  async getAvailableBorrowers(filters = {}) {
    let requests = await borrowRequestService.getAllRequests();
    
    // Client-side filtering
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        requests = requests.filter(r => 
            r.borrowerName.toLowerCase().includes(searchLower) ||
            r.purpose.toLowerCase().includes(searchLower)
        );
    }

    if (filters.riskLevel && filters.riskLevel !== 'All') {
        requests = requests.filter(r => r.riskLevel === filters.riskLevel);
    }

    if (filters.minAmount) {
        requests = requests.filter(r => r.loanAmount >= Number(filters.minAmount));
    }
    
    if (filters.maxAmount) {
        requests = requests.filter(r => r.loanAmount <= Number(filters.maxAmount));
    }

    // Sort by AI Recommendation (Risk Score/Tier)
    // Assuming 'aiRecommendation' means better score/tier first
    requests.sort((a, b) => {
        // Simple sort by interest rate desc (high return) for now
        return b.interestRate - a.interestRate;
    });

    return requests;
  }
};

