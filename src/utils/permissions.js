/**
 * Permission utility functions
 */

/**
 * Get all permissions from localStorage
 * Returns: [{ featureName: "CANDIDATE", permissionScopes: ["READ", "CREATE"] }, ...]
 */
export const getAllPermissions = () => {
  try {
    // Check if localStorage is available (not in service worker, iframe with restrictions, etc.)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return [];
    }
    return JSON.parse(localStorage.getItem("FeaturesPermissions")) || [];
  } catch (e) {
    // Handle "Access to storage is not allowed from this context" error
    if (e.name === 'SecurityError' || e.message?.includes('storage')) {
      console.warn("Storage access not allowed in this context:", e.message);
    } else {
      console.error("Error parsing permissions from localStorage", e);
    }
    return [];
  }
};

/**
 * Get scopes for a specific feature (e.g., "CANDIDATE", "POSITION")
 */
export const getPermissionsForFeature = (featureName) => {
  const permissions = getAllPermissions();
  const feature = permissions.find(
    (p) => p.featureName?.toUpperCase() === featureName.toUpperCase()
  );
  return feature?.permissionScopes || [];
};

/**
 * Check if user has a specific permission scope for a feature
 * e.g. hasPermission("CANDIDATE", "CREATE")
 */
export const hasPermission = (featureName, permissionScopes) => {
  const scopes = getPermissionsForFeature(featureName);
  console.log(`[hasPermission] feature: ${featureName}, scopes:`, scopes);
  return scopes.includes(permissionScopes.toUpperCase());
};

/**
 * Custom hook for feature permissions
 * @param {string} featureName - Feature name
 * @returns {Object} Permission flags
 */
export const useFeaturePermissions = (featureName) => {
  const can = (permissionScopes) => hasPermission(featureName, permissionScopes);

  return {
    canCreate: can("CREATE"),
    canRead: can("READ"),
    canUpdate: can("UPDATE"),
    canDelete: can("DELETE"),
  };
};

