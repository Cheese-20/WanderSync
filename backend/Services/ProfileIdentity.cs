namespace backend.Services
{
    public static class ProfileIdentity
    {
        // Supplied value wins; otherwise use the fallback when one exists; otherwise keep the request value.
        public static string? Resolve(string? requested, string? fallback, bool hasUser)
        {
            if (!string.IsNullOrWhiteSpace(requested)) return requested;
            return hasUser ? fallback : requested;
        }
    }
}
