using Jellyfin.Plugin.CrimsonNoir.Configuration;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;

namespace Jellyfin.Plugin.CrimsonNoir;

/// <summary>
/// Crimson Noir: injects the theme's CSS and scripts into Jellyfin Web (via the File Transformation plugin).
/// </summary>
public sealed class CrimsonNoirPlugin : BasePlugin<PluginConfiguration>, IHasWebPages
{
    public CrimsonNoirPlugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer)
        : base(applicationPaths, xmlSerializer)
    {
        Instance = this;
    }

    public static CrimsonNoirPlugin? Instance { get; private set; }

    public override Guid Id => Guid.Parse("a4fe4b36-2a1d-4909-b78e-69d0816d0add");

    public override string Name => "Crimson Noir";

    public override string Description => "A black Jellyfin theme that shows artwork backdrops, with an accent colour picker.";

    public IEnumerable<PluginPageInfo> GetPages()
    {
        yield return new PluginPageInfo
        {
            Name = Name,
            EmbeddedResourcePath = $"{GetType().Namespace}.Configuration.config.html",
            EnableInMainMenu = true,
            DisplayName = Name,
            MenuIcon = "palette"
        };
    }
}
