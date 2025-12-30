using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Session.Chat
{ 
    public record CreateSessionMessageRequest(

        [Required(ErrorMessage = "Treść wiadomości jest wymagana")]
        [MaxLength(500, ErrorMessage = " Treść wiadmości może mieć maksymalnie 500 znaków")]
        string Text
    );
}