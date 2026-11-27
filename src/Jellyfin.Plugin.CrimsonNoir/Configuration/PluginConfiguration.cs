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

    /// <summary>
    /// Gets or sets the order of the top-bar links after Home, comma-separated (favourites, movies, shows,
    /// collections, watchlist, discover, requests, calendar). Empty keeps the theme's default order.
    /// </summary>
    public string NavOrder { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a TMDB API key (v3 key or v4 read access token). Optional: when Jellyfin Enhanced with Seerr isn't
    /// installed, the theme uses it for films missing from a collection and a person's work outside the library.
    /// It stays on the server; browsers only ask the plugin, which asks TMDB.
    /// </summary>
    public string TmdbApiKey { get; set; } = string.Empty;

    /// <summary>Gets or sets a value indicating whether Movies, Shows, Collections and Favourites get feature tiles between rows.</summary>
    public bool FeatureTiles { get; set; } = true;

    /// <summary>Gets or sets a value indicating whether Movies and Shows have the "Pick for me" button.</summary>
    public bool PickForMe { get; set; } = true;

    /// <summary>Gets or sets how many days count as "new" for the New episode badge on show posters (0 turns the badge off, up to 30).</summary>
    public int NewEpisodeDays { get; set; } = 7;

    /// <summary>Gets or sets a value indicating whether box sets show missing films and people's pages show their other work.</summary>
    public bool MissingFilms { get; set; } = true;

    /// <summary>Gets or sets a value indicating whether Continue Watching cards have a × to take a title off the row.</summary>
    public bool ContinueWatchingRemove { get; set; } = true;

    /// <summary>Gets or sets a value indicating whether posters on Home grow into a larger preview card when hovered.</summary>
    public bool HomeHoverExpand { get; set; } = true;

    /// <summary>Gets or sets a value indicating whether Movies, Shows and Collections show the A–Z letter bar down the right.</summary>
    public bool LibraryAlphabet { get; set; } = true;

    /// <summary>Gets or sets a value indicating whether the player shows the end screen (what's next) when the credits start.</summary>
    public bool EndScreen { get; set; } = true;

    /// <summary>Gets or sets a value indicating whether the film end screen plays the suggested film's trailer (from YouTube) behind it.</summary>
    public bool EndScreenTrailers { get; set; } = true;

    /// <summary>Gets or sets a value indicating whether the profile menu offers Switch profile (the other accounts on the sign-in screen).</summary>
    public bool SwitchProfile { get; set; } = true;

    /// <summary>
    /// Gets or sets how card details (titles, progress, badges) show for people who haven't chosen in their profile
    /// menu: "shown" (always) or "hover" (only while pointing at a card).
    /// </summary>
    public string DefaultMetadata { get; set; } = "shown";

    /// <summary>Gets or sets what the Home slideshow features: "Movie,Series" (both), "Movie" (films) or "Series" (shows).</summary>
    public string SlideshowTypes { get; set; } = "Movie,Series";

    /// <summary>
    /// Gets or sets the highest age rating the slideshow, feature tiles and Pick for me may feature:
    /// "" (no limit), "GB-U", "GB-PG", "GB-12A" or "GB-15". Unrated titles are left out when a limit is set.
    /// </summary>
    public string FeaturedMaxRating { get; set; } = string.Empty;

    /// <summary>Gets or sets the artwork behind the sign-in screen: "on", "family" (U and PG titles only) or "off".</summary>
    public string LoginArtwork { get; set; } = "on";
}
