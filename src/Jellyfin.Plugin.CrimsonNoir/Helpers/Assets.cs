namespace Jellyfin.Plugin.CrimsonNoir.Helpers;

/// <summary>The files the plugin serves at /CrimsonNoir/{name}.</summary>
public static class Assets
{
    public sealed record Asset(string FileName, string ContentType)
    {
        public string ResourceName => $"CrimsonNoir.Assets.{FileName}";

        public bool IsStyle => FileName.EndsWith(".css", StringComparison.Ordinal);
    }

    public static readonly Asset Css = new("crimson-noir.css", "text/css; charset=utf-8");

    public static readonly Asset Script = new("crimson-noir.js", "application/javascript; charset=utf-8");

    public static readonly Asset Guard = new("crimson-noir-guard.js", "application/javascript; charset=utf-8");

    public static readonly Asset JelliumBridge = new("jellium-mpv-bridge.js", "application/javascript; charset=utf-8");

    public static readonly IReadOnlyDictionary<string, Asset> ByFileName =
        new[] { Css, Script, Guard, JelliumBridge }.ToDictionary(a => a.FileName, StringComparer.Ordinal);
}
