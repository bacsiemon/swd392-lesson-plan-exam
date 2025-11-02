using LessonPlanExam.Repositories.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace LessonPlanExam.API.Attributes
{
    /// <summary>
    /// Custom authorization attribute that checks for specific user roles in JWT tokens
    /// If no roles are specified, it only requires authentication
    /// Supports multiple roles - user must have at least one of the specified roles
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
    public class AuthorizeRolesAttribute : Attribute, IAuthorizationFilter
    {
        private readonly EUserRole[] _allowedRoles;
        private readonly bool _requiresOnlyAuthentication;

        /// <summary>
        /// Initialize attribute with specific roles
        /// </summary>
        /// <param name="allowedRoles">Roles that are allowed to access this endpoint</param>
        public AuthorizeRolesAttribute(params EUserRole[] allowedRoles)
        {
            _allowedRoles = allowedRoles ?? new EUserRole[0];
            _requiresOnlyAuthentication = _allowedRoles.Length == 0;
        }

        /// <summary>
        /// Initialize attribute that only requires authentication (no specific roles)
        /// </summary>
        public AuthorizeRolesAttribute()
        {
            _allowedRoles = new EUserRole[0];
            _requiresOnlyAuthentication = true;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            // Skip authorization if the action has [AllowAnonymous] attribute
            if (context.ActionDescriptor.EndpointMetadata.OfType<AllowAnonymousAttribute>().Any())
            {
                return;
            }

            // Check if user is authenticated
            if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new JsonResult(new
                {
                    StatusCode = 401,
                    Data = "Please provide a valid JWT token.",
                    Errors = "MISSING_JWT"
                })
                {
                    StatusCode = 401
                };
                return;
            }

            // If only authentication is required (no specific roles), allow access
            if (_requiresOnlyAuthentication)
            {
                return;
            }

            // Get user role from JWT token claims
            var userRoleClaim = context.HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            
            if (string.IsNullOrEmpty(userRoleClaim))
            {
                context.Result = new JsonResult(new
                {
                    StatusCode = 401,
                    Data = "Role information not found.",
                    Errors = "INVALID_JWT"
                })
                {
                    StatusCode = 401
                };
                return;
            }

            // Try to parse the role claim to EUserRole enum
            if (!Enum.TryParse<EUserRole>(userRoleClaim, true, out var userRole))
            {
                context.Result = new JsonResult(new
                {
                    StatusCode = 401,
                    Data = "Invalid role in token.",
                    Errors = "INVALID_JWT"
                })
                {
                    StatusCode = 401
                };
                return;
            }

            // Check if user has one of the allowed roles
            if (!_allowedRoles.Contains(userRole))
            {
                var allowedRoleNames = string.Join(", ", _allowedRoles.Select(r => r.ToString()));
                context.Result = new JsonResult(new
                {
                    StatusCode = 403,
                    Data = $"Access denied. Required roles: {allowedRoleNames}. Your role: {userRole}",
                    Errors = "INSUFFICIENT_PERMISSIONS"
                })
                {
                    StatusCode = 403
                };
                return;
            }

            // User is authorized - allow access
        }
    }
}