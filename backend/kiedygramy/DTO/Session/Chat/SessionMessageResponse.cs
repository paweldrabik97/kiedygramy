namespace kiedygramy.DTO.Session.Chat
{
      public record SessionMessageResponse(

         int Id,
         int UserId,
         string UserName,
         string Text,
         DateTime CreatedAt

      );
    
}
