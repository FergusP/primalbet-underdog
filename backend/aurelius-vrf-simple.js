// Aurelius VRF Simple Contract for ProofNetwork
const state = {
  owner: null,
  totalRequests: 0,
  metadata: {
    title: "Aurelius VRF Simple",
    description: "Simple VRF service for Aurelius Colosseum",
    version: "1.0.0",
    game: "Aurelius Colosseum"
  }
};

// Initialize contract with owner
function initialize(inputs) {
  if (state.owner !== null) {
    throw new Error("Contract already initialized");
  }
  
  const { from } = inputs;
  if (!from) {
    throw new Error("Owner address required");
  }
  
  state.owner = from;
  return { 
    success: true, 
    message: "VRF contract initialized",
    owner: state.owner 
  };
}

// Main function: Get a random number in range
async function getRandomNumber(inputs) {
  const { min = 0, max = 99 } = inputs;
  
  // Validate inputs
  if (min < 0 || max > 1000000 || min >= max) {
    throw new Error("Invalid range. Min must be >= 0, max <= 1000000, and min < max");
  }
  
  try {
    // Use ProofNetwork VRF to get random number
    const vrfResult = await vrfApi.selectNumber(min, max);
    
    // Track usage
    state.totalRequests++;
    
    return {
      success: true,
      result: vrfResult.result,
      proof: vrfResult.proof,
      range: { min, max }
    };
  } catch (error) {
    throw new Error(`VRF error: ${error.message}`);
  }
}

// Get contract statistics (view function)
function getStats(inputs) {
  return {
    success: true,
    totalRequests: state.totalRequests,
    metadata: state.metadata,
    owner: state.owner
  };
}