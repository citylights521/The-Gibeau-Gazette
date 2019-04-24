$('#notesModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var title = button.data('title');
    var id = button.data('id');
    $("#notes").empty();
    $("#noteMessage").val("");
    // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/notes/" + id
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);

      // If there's a note in the article
      if (data.note) {

        // Place the body of the note in the body textarea
        $("#noteMessage").val(data.note.body);
      }
    });

    // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this);
    modal.find('.modal-title').text('Notes for ' + title);

    modal.find('#addNote').data( "id", id );
  });


  $('#addNote').click(function() {
    var noteButton = $(this);
    var id = noteButton.data('id');
 // Run a POST request to change the note, using what's entered in the inputs
 $.ajax({
    method: "POST",
    url: "/createNote/" + id,
    data: {
      // Value taken from title input
      title: "title",
      // Value taken from note textarea
      body: $("#noteMessage").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#noteMessage").empty();
    });
alert(id);
});