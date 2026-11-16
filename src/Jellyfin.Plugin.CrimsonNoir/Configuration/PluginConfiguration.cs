using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.CrimsonNoir.Configuration;

public sealed class PluginConfiguration : BasePluginConfiguration
{
    /// <summary>Gets or sets a value indicating whether the theme (CSS + script) is added to Jellyfin Web.</summary>
    public bool EnableTheme { get; set; } = true;

    /// <summary>Gets or sets a value indicating whether the Jellium Desktop mpv bridge is added. It does nothing in other clients.</summary>
    public bool EnableJelliumBridge { get; set; } = true;
}
