using System.Collections.Concurrent;
using System.Net.Http.Headers;
using MediaBrowser.Common.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jellyfin.Plugin.CrimsonNoir.Controllers;

/// <summary>
/// A small read-only TMDB proxy for the theme, used when Jellyfin Enhanced with Seerr isn't installed: a collection's
/// films (to show the ones missing from the library) and a person's credits (their work outside the library).
/// The TMDB key from the plugin settings stays on the server. Signed-in users only; answers are cached for 6 hours.
/// </summary>
[ApiController]
[Route("CrimsonNoir/Tmdb")]
[Authorize]
public sealed class CrimsonNoirTmdbController : ControllerBase
{
    private static readonly TimeSpan CacheFor = TimeSpan.FromHours(6);
    private static readonly ConcurrentDictionary<string, (DateTime At, string Body)> Cache = new(StringComparer.Ordinal);

    private readonly IHttpClientFactory _httpClientFactory;

    public CrimsonNoirTmdbController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet("collection/{id:int}")]
    public Task<ActionResult> Collection(int id) => Proxy($"collection/{id}");

    [HttpGet("person/{id:int}/combined_credits")]
    public Task<ActionResult> PersonCredits(int id) => Proxy($"person/{id}/combined_credits");

    private async Task<ActionResult> Proxy(string path)
    {
        string key = (CrimsonNoirPlugin.Instance?.Configuration.TmdbApiKey ?? string.Empty).Trim();
        if (key.Length == 0)
        {
            return NotFound();
        }

        if (Cache.TryGetValue(path, out var hit) && DateTime.UtcNow - hit.At < CacheFor)
        {
            return Content(hit.Body, "application/json");
        }

        // A v4 read access token is a JWT ("eyJ..."); a v3 key goes in the query string
        bool bearer = key.StartsWith("eyJ", StringComparison.Ordinal);
        string url = $"https://api.themoviedb.org/3/{path}?language=en-US" + (bearer ? string.Empty : "&api_key=" + Uri.EscapeDataString(key));
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        if (bearer)
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", key);
        }

        try
        {
            using HttpResponseMessage response = await _httpClientFactory.CreateClient(NamedClient.Default)
                .SendAsync(request, HttpContext.RequestAborted)
                .ConfigureAwait(false);
            if (!response.IsSuccessStatusCode)
            {
                // 401 = the key is wrong; pass TMDB's status through so the theme can stay quiet
                return StatusCode((int)response.StatusCode);
            }

            string body = await response.Content.ReadAsStringAsync(HttpContext.RequestAborted).ConfigureAwait(false);
            Cache[path] = (DateTime.UtcNow, body);
            return Content(body, "application/json");
        }
        catch (HttpRequestException)
        {
            return StatusCode(502);
        }
    }
}
