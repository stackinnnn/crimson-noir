using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.CrimsonNoir.Configuration;

public sealed class PluginConfiguration : BasePluginConfiguration
{
    /// <summary>Gets or sets a value indicating whether the theme (CSS + script) is added to Jellyfin Web.</summary>
    public bool EnableTheme { get; set; } = true;

    /// <summary>Gets or sets a value indicating whether the Jellium Desktop mpv bridge is added. It does nothing in other clients.</summary>
    public bool EnableJelliumBridge { get; set; } = true;

    /// <summary>
    /// Gets or sets the accent everyone starts with until they pick their own in the profile menu:
    /// an accent name (Crimson, Rose, Ember, Amber, Emerald, Teal, Azure, Violet) or a colour as #rrggbb.
    /// </summary>
    public string DefaultAccent { get; set; } = "Crimson";

    /// <summary>Gets or sets a value indicating whether Home shows the theme's slideshow of titles.</summary>
    public bool HomeSlideshow { get; set; } = true;

    /// <summary>Gets or sets how many titles the Home slideshow features (2-20).</summary>
    public int SlideshowCount { get; set; } = 8;

    /// <summary>Gets or sets how many seconds each slideshow title stays on screen (4-30).</summary>
    public int SlideshowSeconds { get; set; } = 9;

    /// <summary>Gets or sets a value indicating whether the slideshow only picks titles the viewer hasn't watched.</summary>
    public bool SlideshowUnwatchedOnly { get; set; }

    /// <summary>Gets or sets a value indicating whether film and episode pages open with "More details" already showing.</summary>
    public bool MoreDetailsOpen { get; set; }

    /// <summary>
    /// Gets or sets the top-bar items left out, comma-separated: favourites, movies, shows, collections,
    /// watchlist, discover, requests, calendar, search, random. Home, Back and the profile button always stay.
    /// </summary>
    public string HiddenNavItems { get; set; } = string.Empty;
}
