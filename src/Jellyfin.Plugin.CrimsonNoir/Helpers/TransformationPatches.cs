using System.Text.Json;
using System.Text.RegularExpressions;
using Jellyfin.Plugin.CrimsonNoir.Configuration;
using Jellyfin.Plugin.CrimsonNoir.Model;

namespace Jellyfin.Plugin.CrimsonNoir.Helpers;

/// <summary>Called by File Transformation whenever Jellyfin Web's index.html is served.</summary>
public static class TransformationPatches
{
    // Tags from an earlier pass: <link>s, <script src>s, and the inline settings <script> (with its contents).
    private static readonly Regex PreviousTags = new(
        "<script[^>]*data-crimson-noir=\"[^\"]*\"[^>]*>.*?</script>|<link[^>]*data-crimson-noir=\"[^\"]*\"[^>]*>",
        RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Singleline);

    private static readonly string[] AccentNames = ["Crimson", "Rose", "Ember", "Amber", "Emerald", "Teal", "Azure", "Violet"];

    private static readonly HashSet<string> NavItems = new(StringComparer.Ordinal)
    {
        "favourites", "movies", "shows", "collections", "watchlist", "discover", "requests", "calendar", "search", "random",
    };

    private static readonly Regex HexColour = new("^#[0-9a-fA-F]{6}$", RegexOptions.Compiled);

    public static string IndexHtml(PatchRequestPayload payload)
    {
        string contents = payload.Contents ?? string.Empty;
        var config = CrimsonNoirPlugin.Instance?.Configuration;
        if (config is null || !contents.Contains("</body>", StringComparison.Ordinal))
        {
            return contents;
        }

        contents = PreviousTags.Replace(contents, string.Empty);

        var assembly = typeof(CrimsonNoirPlugin).Assembly;
        string cacheKey = $"v={assembly.GetName().Version}&b={assembly.ManifestModule.ModuleVersionId:N}";
        string Url(Assets.Asset asset) => $"../CrimsonNoir/{asset.FileName}?{cacheKey}";

        var tags = new List<string>();
        if (config.EnableTheme)
        {
            // Server-wide choices from the plugin's settings page, read by the theme script at start-up.
            tags.Add($"<script data-crimson-noir=\"settings\">window.CrimsonNoirSettings = {SettingsJson(config)};</script>");
            // The stylesheet goes at the end of <body>, where Jellyfin puts Branding > Custom CSS,
            // so it still wins over the stylesheets Jellyfin Web adds to <head> as pages load.
            tags.Add($"<link rel=\"stylesheet\" href=\"{Url(Assets.Css)}\" data-crimson-noir=\"css\" />");
            // Not deferred: switches the stylesheet off at once in browser engines too old for the theme.
            tags.Add($"<script src=\"{Url(Assets.Guard)}\" data-crimson-noir=\"guard\"></script>");
            tags.Add($"<script defer src=\"{Url(Assets.Script)}\" data-crimson-noir=\"js\"></script>");
        }

        if (config.EnableJelliumBridge)
        {
            tags.Add($"<script defer src=\"{Url(Assets.JelliumBridge)}\" data-crimson-noir=\"jellium\"></script>");
        }

        if (tags.Count == 0)
        {
            return contents;
        }

        int bodyEnd = contents.LastIndexOf("</body>", StringComparison.Ordinal);
        return contents.Insert(bodyEnd, string.Concat(tags));
    }

    /// <summary>The settings as a JSON object, tidied to values the theme understands.</summary>
    private static string SettingsJson(PluginConfiguration config)
    {
        string accent = (config.DefaultAccent ?? string.Empty).Trim();
        string? named = AccentNames.FirstOrDefault(n => string.Equals(n, accent, StringComparison.OrdinalIgnoreCase));
        accent = named ?? (HexColour.IsMatch(accent) ? accent.ToLowerInvariant() : "Crimson");

        var settings = new Dictionary<string, object>
        {
            ["DefaultAccent"] = accent,
            ["HomeSlideshow"] = config.HomeSlideshow,
            ["SlideshowCount"] = Math.Clamp(config.SlideshowCount, 2, 20),
            ["SlideshowSeconds"] = Math.Clamp(config.SlideshowSeconds, 4, 30),
            ["SlideshowUnwatchedOnly"] = config.SlideshowUnwatchedOnly,
            ["MoreDetailsOpen"] = config.MoreDetailsOpen,
            ["HiddenNavItems"] = (config.HiddenNavItems ?? string.Empty)
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(item => item.ToLowerInvariant())
                .Where(item => NavItems.Contains(item))
                .Distinct()
                .ToArray(),
        };

        // Inside a <script> element, so "</" must not appear literally.
        return JsonSerializer.Serialize(settings).Replace("</", "<\\/", StringComparison.Ordinal);
    }
}
