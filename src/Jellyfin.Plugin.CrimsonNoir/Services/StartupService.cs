using System.Reflection;
using System.Runtime.Loader;
using Jellyfin.Plugin.CrimsonNoir.Helpers;
using MediaBrowser.Model.Tasks;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;

namespace Jellyfin.Plugin.CrimsonNoir.Services;

/// <summary>Registers the index.html transformation with the File Transformation plugin at startup.</summary>
/// <remarks>Approach adapted from SleekFin (https://github.com/varunaditya-plus/SleekFin), MIT, Copyright (c) 2026 varunaditya-plus.</remarks>
public sealed class StartupService : IScheduledTask
{
    private static readonly Guid IndexHtmlTransformationId = Guid.Parse("3ab344ea-b180-44bb-a84f-fabf8f65a349");
    private readonly ILogger<StartupService> _logger;

    public StartupService(ILogger<StartupService> logger)
    {
        _logger = logger;
    }

    public string Name => "Crimson Noir Startup";

    public string Key => "Jellyfin.Plugin.CrimsonNoir.Startup";

    public string Description => "Adds Crimson Noir to Jellyfin Web.";

    public string Category => "Startup Services";

    public Task ExecuteAsync(IProgress<double> progress, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        try
        {
            Assembly? fileTransformation = AssemblyLoadContext.All
                .SelectMany(context => context.Assemblies)
                .FirstOrDefault(assembly => assembly.GetName().Name?.Contains(".FileTransformation", StringComparison.Ordinal) == true);

            if (fileTransformation is null)
            {
                _logger.LogWarning("Crimson Noir needs the File Transformation plugin to add itself to Jellyfin Web. Install it from https://www.iamparadox.dev/jellyfin/plugins/manifest.json");
                return Task.CompletedTask;
            }

            MethodInfo? register = fileTransformation
                .GetType("Jellyfin.Plugin.FileTransformation.PluginInterface")
                ?.GetMethod("RegisterTransformation", BindingFlags.Public | BindingFlags.Static, binder: null, types: [typeof(JObject)], modifiers: null);

            if (register is null)
            {
                _logger.LogWarning("Crimson Noir could not find File Transformation's RegisterTransformation method; is it up to date?");
                return Task.CompletedTask;
            }

            var payload = new JObject
            {
                ["id"] = IndexHtmlTransformationId,
                ["fileNamePattern"] = "index.html",
                ["callbackAssembly"] = GetType().Assembly.FullName,
                ["callbackClass"] = typeof(TransformationPatches).FullName,
                ["callbackMethod"] = nameof(TransformationPatches.IndexHtml)
            };

            register.Invoke(null, [payload]);
            _logger.LogInformation("Crimson Noir registered with File Transformation.");
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogWarning(ex, "Crimson Noir could not register with File Transformation; Jellyfin Web is unchanged.");
        }

        return Task.CompletedTask;
    }

    public IEnumerable<TaskTriggerInfo> GetDefaultTriggers()
    {
        yield return new TaskTriggerInfo { Type = TaskTriggerInfoType.StartupTrigger };
    }
}
