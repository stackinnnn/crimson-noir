using System.Text.Json.Serialization;

namespace Jellyfin.Plugin.CrimsonNoir.Model;

/// <summary>What File Transformation hands to a transformation callback.</summary>
public sealed class PatchRequestPayload
{
    [JsonPropertyName("contents")]
    public string? Contents { get; set; }
}
