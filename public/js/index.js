function modalRefresh(title, id) {

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
        var notesDiv = $("#notes");
        data.note.forEach(element => {
          var outerDiv = $("<div></div>");
          var noteSpan = $("<span></span>").attr("class", "modalNote").text(element.body);
          outerDiv.append(noteSpan);

          var removeButton = $("<button></button>")
                .attr("class", "modalNoteButton")
                .data("id", element._id)
                .text("X")
                .click(function() {
                  var button = $(this);
                  var noteId = button.data("id");

                  $.ajax({
                    method: "POST",
                    url: "/deleteNote/" + noteId,                
                  })
                  .then(function(err) {
                    if (err) {
                      console.log(err);
                    }
                    else {
                      modalRefresh(title, id)
                    }
                    
                  })
                });

          outerDiv.append(removeButton);
          notesDiv.append(outerDiv);
        });

        // Place the body of the note in the body textarea
        $("#noteMessage").val(data.note.body);
      }
    });

    // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $("#notesModal");
    modal.find('.modal-title').text('Notes for ' + title);
    modal.find('#addNote').data("title", title);

    modal.find('#addNote').data( "id", id );
}




$('#notesModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var title = button.data('title');
    var id = button.data('id');
    modalRefresh(title, id);
  });


  $('#addNote').click(function() {
    var noteButton = $(this);
    var id = noteButton.data('id');
    var title = noteButton.data('title');
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
      modalRefresh(title, id);
      // Empty the notes section
      $("#noteMessage").empty();
    });

});

$("#scraper").click(function () {
  $.ajax({
    method: "GET",
    url: "/scrape"
  }).then(function (data) {
    window.location.reload();
  });
})