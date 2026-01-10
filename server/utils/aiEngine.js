export const calculateRiskScore = async (userProfile) => {
    console.log("AI Engine: Calculating specific risk score for", userProfile.name);
    
    let score = 50; // Base Score

    const { monthlyIncome, monthlyExpenses, employmentType } = userProfile.financialProfile;

    // 1. Employment Stability Factor
    switch (employmentType) {
        case 'Full-time': score += 25; break;
        case 'Self-employed': score += 15; break;
        case 'Part-time': score += 5; break;
        case 'Unemployed': score -= 30; break;
        default: score += 0;
    }

    // 2. Financial Health Factor (Disposable Income Ratio)
    if (monthlyIncome > 0) {
        const expenseRatio = monthlyExpenses / monthlyIncome;
        
        if (expenseRatio < 0.30) score += 25;       // Very healthy
        else if (expenseRatio < 0.50) score += 15;  // Healthy
        else if (expenseRatio < 0.70) score += 5;   // Moderate
        else if (expenseRatio > 0.90) score -= 20;  // High risk
    } else {
        score -= 20; // No income
    }

    // 3. Absolute Income Factor (Ability to handle shocks)
    const disposableIncome = monthlyIncome - monthlyExpenses;
    if (disposableIncome > 2000) score += 10;
    else if (disposableIncome > 1000) score += 5;
    else if (disposableIncome < 0) score -= 20;

    // Cap score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    return Math.floor(score);
};

export const assignRiskTier = (score) => {
    // Defines the risk bucket and implicitly the interest rate range
    if (score >= 85) return 'A'; // Prime
    if (score >= 70) return 'B'; // Good
    if (score >= 50) return 'C'; // Fair
    return 'D'; // High Risk
};

export const recommendLoans = async (lenderPreferences, activeLoans) => {
    // lenderPreferences: { riskTolerance: 'Low' | 'Medium' | 'High' }
    
    // Sort loans based on "Smart Value" (Interest Rate / Risk Weight)
    /* 
       Optimization Goal: Maximize return while staying within risk bounds.
       - Low Risk User: Wants Tier A/B.
       - High Risk User: Wants Tier C/D (High Yield).
    */

    const { riskTolerance } = lenderPreferences;

    // Filter allowed tiers
    const allowedTiers = {
        'Low': ['A', 'B'],
        'Medium': ['A', 'B', 'C'],
        'High': ['A', 'B', 'C', 'D']
    }[riskTolerance || 'Medium']; // Default to Medium

    // Filter loans
    let recommended = activeLoans.filter(loan => allowedTiers.includes(loan.riskTier));

    // Sort strategy:
    // If High risk tolerance: Sort by Interest Rate (Desc)
    // If Low risk tolerance: Sort by Risk Tier (A -> B) then Interest Rate
    
    recommended.sort((a, b) => {
        if (riskTolerance === 'High') {
            return b.interestRate - a.interestRate;
        } else {
            // Sort by Tier first (A < B < C < D)
            if (a.riskTier !== b.riskTier) {
                return a.riskTier.localeCompare(b.riskTier);
            }
            // Tie-break with Interest Rate
            return b.interestRate - a.interestRate;
        }
    });

    return recommended;
};
