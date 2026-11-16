using System.Text.RegularExpressions;
using Jellyfin.Plugin.CrimsonNoir.Model;

namespace Jellyfin.Plugin.CrimsonNoir.Helpers;

/// <summary>Called by File Transformation whenever Jellyfin Web's index.html is served.</summary>
public static class TransformationPatches
{
    private static readonly Regex PreviousTags = new(
        "<(?:link|script)[^>]*data-crimson-noir=\"[^\"]*\"[^>]*>(?:</script>)?",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

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
}
