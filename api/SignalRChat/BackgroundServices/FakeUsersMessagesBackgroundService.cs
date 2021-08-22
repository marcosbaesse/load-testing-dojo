
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using SignalRChat.Hubs;

namespace SignalRChat.BackgroundServices
{
    public class FakeUsersMessagesBackgroundService : BackgroundService
    {
        private Timer _timer;
        private readonly IHubContext<ChatHub> _hubContext;

        public FakeUsersMessagesBackgroundService(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _timer = new Timer(async _ => await DoWork(stoppingToken), null, TimeSpan.Zero, TimeSpan.FromSeconds(5));

            await DoWork(stoppingToken);
        }

        private async Task DoWork(CancellationToken stoppingToken)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Service", $"It is {DateTime.UtcNow}", stoppingToken);
        }

        public override async Task StopAsync(CancellationToken stoppingToken)
        {
            _timer?.Change(Timeout.Infinite, 0);

            await base.StopAsync(stoppingToken);
        }

        public override void Dispose()
        {
            _timer?.Dispose();

            base.Dispose();
        }
    }
}
