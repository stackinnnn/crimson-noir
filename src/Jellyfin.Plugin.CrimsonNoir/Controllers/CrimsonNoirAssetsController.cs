using Jellyfin.Plugin.CrimsonNoir.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jellyfin.Plugin.CrimsonNoir.Controllers;

/// <summary>Serves the theme files embedded in the plugin at /CrimsonNoir/{file}.</summary>
[ApiController]
[Route("CrimsonNoir")]
public sealed class CrimsonNoirAssetsController : ControllerBase
{
    [HttpGet("{fileName}")]
    [AllowAnonymous]
    public ActionResult GetAsset(string fileName)
    {
        if (!Assets.ByFileName.TryGetValue(fileName, out Assets.Asset? asset))
        {
            return NotFound();
        }

        Stream? stream = typeof(CrimsonNoirPlugin).Assembly.GetManifestResourceStream(asset.ResourceName);
        if (stream is null)
        {
            return NotFound();
        }

        // URLs carry the plugin version + build id, so a new release always gets fetched fresh.
        Response.Headers.CacheControl = "public, max-age=31536000, immutable";
        return File(stream, asset.ContentType);
    }
}
