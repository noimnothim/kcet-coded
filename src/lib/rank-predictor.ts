// KCET 2025 Rank Analysis - Enhanced prediction table based on comprehensive data
export const kcet2025RankTable = [
  // Top performers (95-100%)
  { score: 96.22, rank: 81 },
  { score: 94.06, rank: 308 },
  { score: 90.00, rank: 1245 },
  { score: 85.00, rank: 3804 },
  { score: 80.00, rank: 8500 },
  
  // Mid-range performers (70-80%)
  { score: 75.00, rank: 16000 },
  { score: 70.00, rank: 30000 },
  { score: 65.00, rank: 50000 },
  { score: 60.00, rank: 80000 },
  
  // Lower performers (50-60%)
  { score: 50.00, rank: 155000 },
  { score: 40.00, rank: 235000 },
  { score: 35.00, rank: 259000 }
]

// Rank gap analysis by aggregate band
export const rankGapAnalysis = [
  { range: "95-100%", rankRange: "1-200", candidatesPer1Percent: "20-30" },
  { range: "90-95%", rankRange: "200-1,200", candidatesPer1Percent: "200-300" },
  { range: "85-90%", rankRange: "1,200-3,000", candidatesPer1Percent: "350-400" },
  { range: "80-85%", rankRange: "3,000-8,000", candidatesPer1Percent: "1,000" },
  { range: "75-80%", rankRange: "8,000-16,000", candidatesPer1Percent: "1,500" },
  { range: "70-75%", rankRange: "16,000-30,000", candidatesPer1Percent: "2,800" },
  { range: "60-70%", rankRange: "30,000-75,000", candidatesPer1Percent: "4,000-5,000" },
  { range: "50-60%", rankRange: "75,000-1,55,000", candidatesPer1Percent: "8,000-9,000" },
  { range: "40-50%", rankRange: "1,55,000-2,35,000", candidatesPer1Percent: "8,000" },
  { range: "30-40%", rankRange: "2,35,000-2,59,000", candidatesPer1Percent: "10,000" }
]

// Cutoff estimates for 2025
export const cutoffEstimates2025 = [
  { targetRank: "Top 100", expectedAggregate: "96%+" },
  { targetRank: "Top 1,000", expectedAggregate: "92.5%+" },
  { targetRank: "Top 5,000", expectedAggregate: "84.5%+" },
  { targetRank: "Top 10,000", expectedAggregate: "79%+" },
  { targetRank: "Top 20,000", expectedAggregate: "74.5%+" },
  { targetRank: "Top 50,000", expectedAggregate: "65%+" },
  { targetRank: "Top 100,000", expectedAggregate: "57%+" }
]

// Legacy rank table for backward compatibility
export const rankTable = kcet2025RankTable

// Historical trend data
export const trendData = {
  2022: [1, 150, 1200, 1800, 3500, 7000, 13000, 25000, 40000, 55000, 70000, 85000, 110000, 140000, 170000],
  2023: [1, 180, 1300, 1900, 3800, 7500, 14000, 28000, 43000, 58000, 72000, 88000, 115000, 150000, 180000],
  2024: [1, 200, 1500, 2000, 4000, 8000, 15000, 30000, 45000, 60000, 75000, 90000, 120000, 160000, 190000]
}

export interface RankPrediction {
  low: number
  medium: number
  high: number
  composite: number
  percentile?: string
  rankBand?: string
  competitionLevel?: string
}

export interface RankAnalysis {
  rankGap: string
  candidatesPerPercent: string
  competitionLevel: string
  improvementPotential: string
}

// Enhanced KCET 2025 rank prediction using comprehensive data analysis
export const predictKCETRank = (cet: number, puc: number): RankPrediction => {
  try {
    const kcetPercentage = (cet / 180) * 100
    // Using 60/40 weight based on KCET 2025 analysis
    const combinedScore = 0.6 * kcetPercentage + 0.4 * puc

    if (isNaN(combinedScore) || combinedScore < 0 || combinedScore > 100) {
      throw new Error('Please enter valid marks (KCET: 0-180, PUC: 0-100)')
    }

    let result: RankPrediction | null = null
    
    // Handle extreme cases
    if (combinedScore >= kcet2025RankTable[0].score) {
      result = { 
        low: 1, 
        medium: 1, 
        high: 1, 
        composite: combinedScore,
        percentile: "Top 0.01%",
        rankBand: "Elite",
        competitionLevel: "Extremely High"
      }
    } else if (combinedScore <= kcet2025RankTable[kcet2025RankTable.length - 1].score) {
      result = { 
        low: 250000, 
        medium: 260000, 
        high: 270000, 
        composite: combinedScore,
        percentile: "Bottom 20%",
        rankBand: "Lower",
        competitionLevel: "Moderate"
      }
    } else {
      // Interpolate between data points
      for (let i = 0; i < kcet2025RankTable.length - 1; i++) {
        const currentEntry = kcet2025RankTable[i]
        const nextEntry = kcet2025RankTable[i + 1]
        
        if (combinedScore <= currentEntry.score && combinedScore >= nextEntry.score) {
          const scoreDiff = currentEntry.score - nextEntry.score
          const rankDiff = nextEntry.rank - currentEntry.rank
          const scoreOffset = currentEntry.score - combinedScore
          const interpolatedRank = currentEntry.rank + (scoreOffset / scoreDiff) * rankDiff
          
          const medium = Math.round(interpolatedRank)
          const low = Math.round(medium * 0.95)
          const high = Math.round(medium * 1.05)
          
          result = { 
            low, 
            medium, 
            high, 
            composite: combinedScore,
            percentile: calculatePercentile(medium),
            rankBand: getRankBand(medium),
            competitionLevel: getCompetitionLevel(combinedScore)
          }
          break
        }
      }
    }

    // Fallback to closest match
    if (!result) {
      let closest = kcet2025RankTable[0]
      let minDiff = Math.abs(combinedScore - closest.score)
      
      for (let i = 1; i < kcet2025RankTable.length; i++) {
        const diff = Math.abs(combinedScore - kcet2025RankTable[i].score)
        if (diff < minDiff) {
          minDiff = diff
          closest = kcet2025RankTable[i]
        }
      }
      
      const medium = Math.round(closest.rank)
      result = {
        low: Math.round(medium * 0.95),
        medium,
        high: Math.round(medium * 1.05),
        composite: combinedScore,
        percentile: calculatePercentile(medium),
        rankBand: getRankBand(medium),
        competitionLevel: getCompetitionLevel(combinedScore)
      }
    }

    return result
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error calculating rank')
  }
}

// Enhanced utility functions for KCET 2025 analysis

export const getRankBand = (rank: number): string => {
  if (rank <= 200) return 'Elite'
  if (rank <= 1200) return 'Excellent'
  if (rank <= 3000) return 'Very Good'
  if (rank <= 8000) return 'Good'
  if (rank <= 16000) return 'Above Average'
  if (rank <= 30000) return 'Average'
  if (rank <= 50000) return 'Below Average'
  if (rank <= 80000) return 'Lower'
  if (rank <= 155000) return 'Poor'
  return 'Very Poor'
}

export const getCompetitionLevel = (score: number): string => {
  if (score >= 95) return 'Extremely High'
  if (score >= 90) return 'Very High'
  if (score >= 85) return 'High'
  if (score >= 80) return 'Moderately High'
  if (score >= 75) return 'Moderate'
  if (score >= 70) return 'Moderately Low'
  if (score >= 60) return 'Low'
  return 'Very Low'
}

export const getRankGapAnalysis = (score: number): RankAnalysis => {
  const band = rankGapAnalysis.find(band => {
    const [min, max] = band.range.split('-').map(s => parseFloat(s.replace('%', '')))
    return score >= min && score <= max
  }) || rankGapAnalysis[rankGapAnalysis.length - 1]

  return {
    rankGap: band.rankRange,
    candidatesPerPercent: band.candidatesPer1Percent,
    competitionLevel: getCompetitionLevel(score),
    improvementPotential: score >= 80 ? 'Limited' : score >= 60 ? 'Moderate' : 'High'
  }
}

export const getPercentile = (composite: number): string => {
  if (composite >= 95) return 'Top 1%'
  if (composite >= 90) return 'Top 5%'
  if (composite >= 80) return 'Top 15%'
  if (composite >= 70) return 'Top 30%'
  if (composite >= 60) return 'Top 50%'
  return 'Below Average'
}

export const calculatePercentile = (rank: number): string => {
  const totalCandidates = 260000 // Updated based on KCET 2025 data
  const percentile = ((totalCandidates - rank) / totalCandidates * 100).toFixed(2)
  return `${percentile}%`
}

export const getRankAnalysis = (rank: number): string => {
  if (rank <= 200) return 'Elite rank! Top colleges like RVCE, BMSCE, MSRIT are within reach.'
  if (rank <= 1200) return 'Excellent rank! Strong chances for premier engineering colleges.'
  if (rank <= 3000) return 'Very good rank! Good options for top-tier colleges.'
  if (rank <= 8000) return 'Good rank! Solid chances for reputed colleges.'
  if (rank <= 16000) return 'Above average rank. Consider various college options.'
  if (rank <= 30000) return 'Average rank. Explore multiple college choices.'
  if (rank <= 50000) return 'Below average rank. Consider all available options.'
  if (rank <= 80000) return 'Lower rank. Focus on colleges with higher acceptance rates.'
  if (rank <= 155000) return 'Poor rank. Consider alternative pathways and colleges.'
  return 'Very poor rank. Explore all possible options including diploma courses.'
}

// Get cutoff estimates for target ranks
export const getCutoffEstimates = () => {
  return cutoffEstimates2025
}

// Enhanced college suggestions based on KCET 2025 data
export const getCollegeSuggestions = (rank: number, category: string) => {
  const colleges = {
    general: [
      { rank: 200, name: 'RVCE, BMSCE, IISc', branch: 'CSE, ECE, EEE' },
      { rank: 1200, name: 'MSRIT, PESIT, BMSIT', branch: 'CSE, ECE, ISE' },
      { rank: 3000, name: 'SIT, NMIT, DSCE', branch: 'CSE, ECE, ME' },
      { rank: 8000, name: 'CIT, SJCE, UVCE', branch: 'All branches' },
      { rank: 16000, name: 'Regional colleges', branch: 'All branches' },
      { rank: 30000, name: 'Private colleges', branch: 'All branches' }
    ],
    obc: [
      { rank: 300, name: 'RVCE, BMSCE', branch: 'CSE, ECE' },
      { rank: 1500, name: 'MSRIT, PESIT', branch: 'CSE, ECE' },
      { rank: 4000, name: 'SIT, NMIT', branch: 'CSE, ECE' },
      { rank: 10000, name: 'CIT, SJCE', branch: 'All branches' },
      { rank: 20000, name: 'Regional colleges', branch: 'All branches' },
      { rank: 40000, name: 'Private colleges', branch: 'All branches' }
    ],
    sc: [
      { rank: 500, name: 'RVCE, BMSCE', branch: 'CSE, ECE' },
      { rank: 2000, name: 'MSRIT, PESIT', branch: 'CSE, ECE' },
      { rank: 6000, name: 'SIT, NMIT', branch: 'CSE, ECE' },
      { rank: 15000, name: 'CIT, SJCE', branch: 'All branches' },
      { rank: 30000, name: 'Regional colleges', branch: 'All branches' },
      { rank: 60000, name: 'Private colleges', branch: 'All branches' }
    ],
    st: [
      { rank: 800, name: 'RVCE, BMSCE', branch: 'CSE, ECE' },
      { rank: 3000, name: 'MSRIT, PESIT', branch: 'CSE, ECE' },
      { rank: 8000, name: 'SIT, NMIT', branch: 'CSE, ECE' },
      { rank: 20000, name: 'CIT, SJCE', branch: 'All branches' },
      { rank: 40000, name: 'Regional colleges', branch: 'All branches' },
      { rank: 80000, name: 'Private colleges', branch: 'All branches' }
    ]
  }
  const suggestions = colleges[category as keyof typeof colleges] || colleges.general
  return suggestions.find(s => rank <= s.rank) || { name: 'Other colleges', branch: 'All branches' }
}
