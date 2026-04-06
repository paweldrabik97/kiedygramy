using kiedygramy.DTO.Common;
using kiedygramy.Infrastructure;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using kiedygramy.Application.Errors;


using MimeKit;

namespace kiedygramy.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly EmailOptions _options;
        private readonly FrontendOptions _frontOptions;
        private readonly ILogger<EmailService> _logger;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public EmailService(IOptions<EmailOptions> options, IOptions<FrontendOptions> frontOptions, ILogger<EmailService> logger, IWebHostEnvironment webHostEnvironment)
        {
            _options = options.Value;
            _frontOptions = frontOptions.Value;
            _logger = logger;
            _webHostEnvironment = webHostEnvironment;         
        }

        public async Task<ErrorResponseDto?> SendConfirmationEmailAsync(string email, string token)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("KiedyGramy", _options.FromEmail));
            message.To.Add(new MailboxAddress("", email));
            message.Subject = "Confirm your email address";

            var encodedToken = Uri.EscapeDataString(token);
            var confirmUrl = $"{_frontOptions.Origin}/confirm-email?token={encodedToken}&email={email}";

            var templatePath = Path.Combine(_webHostEnvironment.ContentRootPath, "Templates", "Email", "ConfirmationEmail.html");

            var messageBody = await File.ReadAllTextAsync(templatePath);
            var finalMessage = messageBody.Replace("{{confirmUrl}}", confirmUrl);

            message.Body = new TextPart("html")
            {
                Text = finalMessage
            };

            try
            {
                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(_options.Host, _options.Port, _options.EnableSsl);
                await smtp.AuthenticateAsync(_options.Username, _options.Password);
                await smtp.SendAsync(message);
                await smtp.DisconnectAsync(true);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "failed to connect into smtp");
                return Errors.Email.FailedToConnectSmtp();
            }

            return null;
        }
    }
}
