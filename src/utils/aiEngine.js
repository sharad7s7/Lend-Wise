/**
 * Simulated AI Engine for Credit Assessment
 * This module provides realistic credit scoring and risk assessment logic
 */

// Employment type risk multipliers
const EMPLOYMENT_RISK = {
  'Student': 1.2,
  'Salaried': 0.9,
  'Freelance': 1.3,
};

// Repayment behavior scores
const REPAYMENT_SCORES = {
  'Excellent': 90,
  'Average': 60,
  'Poor': 25,
};

/**
 * Calculate income stability score (0-100)
 */
function calculateIncomeStability(monthlyIncome, employmentType) {
  let stability = 50; // Base score
  
  // Higher income = more stability
  if (monthlyIncome >= 5000) stability += 30;
  else if (monthlyIncome >= 3000) stability += 20;
  else if (monthlyIncome >= 1500) stability += 10;
  else stability -= 10;
  
  // Employment type adjustment
  const employmentMultiplier = EMPLOYMENT_RISK[employmentType] || 1.0;
  stability = Math.max(0, Math.min(100, stability * (2 - employmentMultiplier)));
  
  return Math.round(stability);
}

/**
 * Calculate loan-to-income ratio score (0-100)
 */
function calculateLoanToIncomeScore(loanAmount, monthlyIncome, duration) {
  const monthlyPayment = loanAmount / duration;
  const ratio = monthlyPayment / monthlyIncome;
  
  // Lower ratio = better score
  if (ratio <= 0.2) return 100;
  if (ratio <= 0.3) return 85;
  if (ratio <= 0.4) return 70;
  if (ratio <= 0.5) return 55;
  if (ratio <= 0.6) return 40;
  return Math.max(0, 30 - (ratio - 0.6) * 50);
}

/**
 * Calculate default probability (0-100%)
 */
function calculateDefaultProbability(creditScore, loanAmount, monthlyIncome) {
  let baseProbability = 100 - creditScore; // Inverse of credit score
  
  // Adjust based on loan amount relative to income
  const incomeMultiplier = monthlyIncome / 2000; // Normalize to 2000
  const loanRisk = (loanAmount / (monthlyIncome * 6)); // Loan vs 6 months income
  
  baseProbability += (loanRisk - 0.5) * 20;
  baseProbability *= (1.5 - Math.min(1.0, incomeMultiplier * 0.5));
  
  return Math.max(5, Math.min(95, Math.round(baseProbability)));
}

/**
 * Calculate suggested interest rate (%)
 */
function calculateInterestRate(creditScore, defaultProbability, employmentType) {
  // Base rate starts at 8%
  let rate = 8;
  
  // Adjust based on credit score
  if (creditScore >= 80) rate -= 2;
  else if (creditScore >= 70) rate -= 1;
  else if (creditScore >= 60) rate += 1;
  else if (creditScore >= 50) rate += 3;
  else rate += 5;
  
  // Adjust based on default probability
  rate += (defaultProbability - 20) / 10;
  
  // Employment type adjustment
  const employmentRisk = EMPLOYMENT_RISK[employmentType] || 1.0;
  rate *= employmentRisk;
  
  return Math.max(5, Math.min(25, Math.round(rate * 10) / 10));
}

/**
 * Determine risk category
 */
function getRiskCategory(creditScore, defaultProbability) {
  if (creditScore >= 75 && defaultProbability <= 20) return 'Low';
  if (creditScore >= 60 && defaultProbability <= 35) return 'Medium';
  return 'High';
}

/**
 * Determine approval status
 */
function getApprovalStatus(creditScore, defaultProbability, loanAmount, monthlyIncome) {
  // Reject if credit score too low
  if (creditScore < 40) return 'Rejected';
  
  // Reject if default probability too high
  if (defaultProbability > 60) return 'Rejected';
  
  // Reject if loan amount is too high relative to income
  if (loanAmount > monthlyIncome * 12) return 'Rejected';
  
  // Conditional approval for medium risk
  if (creditScore < 60 || defaultProbability > 40) return 'Conditional';
  
  return 'Approved';
}

/**
 * Generate explainable AI insights
 */
function generateExplanation(assessment) {
  const {
    creditScore,
    riskCategory,
    defaultProbability,
    interestRate,
    approvalStatus,
    incomeStability,
    loanToIncomeScore,
    repaymentScore,
    monthlyIncome,
    employmentType,
    loanAmount,
  } = assessment;
  
  const explanations = [];
  
  // Why AI-based trust is needed
  explanations.push({
    title: 'Why AI-Based Trust Assessment?',
    content: 'Since there is no personal connection or social trust history, our AI analyzes your financial profile to assess creditworthiness. This ensures fair access to lending opportunities for new users.',
  });
  
  // Income stability explanation
  const incomeLevel = monthlyIncome >= 5000 ? 'strong' : monthlyIncome >= 3000 ? 'moderate' : 'limited';
  explanations.push({
    title: 'Income Stability Analysis',
    content: `Your monthly income of $${monthlyIncome.toLocaleString()} indicates ${incomeLevel} financial capacity. ${employmentType === 'Student' ? 'As a student, income may be less predictable, which slightly increases risk.' : employmentType === 'Freelance' ? 'Freelance income can be variable, requiring additional risk consideration.' : 'Salaried employment provides stable income, reducing risk.'} Your income stability score is ${incomeStability}/100.`,
  });
  
  // Loan-to-income ratio
  const monthlyPayment = loanAmount / (assessment.duration || 12);
  const ratio = (monthlyPayment / monthlyIncome * 100).toFixed(1);
  explanations.push({
    title: 'Loan Affordability',
    content: `Your requested loan of $${loanAmount.toLocaleString()} represents approximately ${ratio}% of your monthly income. ${ratio <= 30 ? 'This is a manageable ratio, indicating good affordability.' : ratio <= 40 ? 'This ratio is acceptable but requires careful budgeting.' : 'This ratio is high and increases repayment risk.'} Your affordability score is ${loanToIncomeScore}/100.`,
  });
  
  // Repayment behavior
  explanations.push({
    title: 'Repayment History Impact',
    content: `Your ${assessment.repaymentBehavior} repayment history contributes ${repaymentScore} points to your credit score. ${assessment.repaymentBehavior === 'Excellent' ? 'Strong past performance significantly reduces risk.' : assessment.repaymentBehavior === 'Average' ? 'Average history requires standard risk pricing.' : 'Poor repayment history increases risk and interest rates.'}`,
  });
  
  // Risk category explanation
  explanations.push({
    title: 'Risk Assessment',
    content: `Based on comprehensive analysis, you are classified as ${riskCategory} risk. This is determined by your credit score of ${creditScore}/100 and an estimated default probability of ${defaultProbability}%. ${riskCategory === 'Low' ? 'Low risk borrowers receive favorable interest rates.' : riskCategory === 'Medium' ? 'Medium risk requires standard market rates.' : 'High risk borrowers face higher rates to compensate lenders for increased default risk.'}`,
  });
  
  // Interest rate explanation
  const avgRate = 12; // Market average
  const rateComparison = interestRate > avgRate ? 'higher' : interestRate < avgRate ? 'lower' : 'at';
  explanations.push({
    title: 'Interest Rate Rationale',
    content: `Your suggested interest rate of ${interestRate}% is ${rateComparison} the market average of ${avgRate}%. This rate reflects your ${riskCategory.toLowerCase()} risk profile and ensures fair compensation for lenders while remaining competitive for borrowers. The rate is calculated based on your credit score, default probability, and employment stability.`,
  });
  
  // Approval status
  if (approvalStatus === 'Approved') {
    explanations.push({
      title: 'Approval Decision',
      content: 'Your application has been approved. Your credit profile meets our lending criteria, and you qualify for the requested loan amount under standard terms.',
    });
  } else if (approvalStatus === 'Conditional') {
    explanations.push({
      title: 'Conditional Approval',
      content: 'Your application has been conditionally approved. You may be required to provide additional documentation or accept adjusted terms. A loan officer will review your case.',
    });
  } else {
    explanations.push({
      title: 'Application Status',
      content: 'Your application requires further review. Based on current assessment, the risk profile exceeds acceptable thresholds. Consider improving your credit profile or reducing the loan amount.',
    });
  }
  
  return explanations;
}

/**
 * Main AI assessment function
 */
export function assessCredit(applicationData) {
  const {
    monthlyIncome,
    employmentType,
    loanAmount,
    duration,
    repaymentBehavior,
  } = applicationData;
  
  // Calculate component scores
  const incomeStability = calculateIncomeStability(monthlyIncome, employmentType);
  const loanToIncomeScore = calculateLoanToIncomeScore(loanAmount, monthlyIncome, duration);
  const repaymentScore = REPAYMENT_SCORES[repaymentBehavior] || 50;
  
  // Weighted credit score calculation
  const creditScore = Math.round(
    incomeStability * 0.35 +
    loanToIncomeScore * 0.30 +
    repaymentScore * 0.35
  );
  
  // Calculate derived metrics
  const defaultProbability = calculateDefaultProbability(creditScore, loanAmount, monthlyIncome);
  const interestRate = calculateInterestRate(creditScore, defaultProbability, employmentType);
  const riskCategory = getRiskCategory(creditScore, defaultProbability);
  const approvalStatus = getApprovalStatus(creditScore, defaultProbability, loanAmount, monthlyIncome);
  
  const assessment = {
    creditScore,
    riskCategory,
    defaultProbability,
    interestRate,
    approvalStatus,
    incomeStability,
    loanToIncomeScore,
    repaymentScore,
    monthlyIncome,
    employmentType,
    loanAmount,
    duration,
    repaymentBehavior,
  };
  
  // Generate explanations
  const explanations = generateExplanation(assessment);
  
  return {
    ...assessment,
    explanations,
  };
}

