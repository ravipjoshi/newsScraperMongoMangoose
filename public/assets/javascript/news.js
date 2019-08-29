$(document).ready(() => {
    const setActive = element => {
      $("#navbar-list li.active").removeClass("active");
      $(element).addClass("active");
    };
  
    const getNotes = id => {
      const url = `/api/notes/${id}`;
      console.log("GET request: " + url);
  
      $.ajax(url, {
        type: "GET"
      })
      .then(results => {
        $("#modalNotesForm .modal-body").html(results);
  
        $("#modalNotesForm").modal("show");
      })
      .fail(error => console.error(error));
    };
  
    const getMessageDiv = message =>
      $("<div>")
        .addClass("card")
        .append($("<div>")
                  .addClass("card-body primary-color text-center")
                  .append($("<p>")
                            .addClass("note card-text d-inline white-text font-bold")
                            .text(message)));
  
    const addNoHeadlinesMessage = message => {
      let divCard = getMessageDiv(message);
  
      $(".headlines").append(divCard);
    };
    
    const addNoNotesMessage = () => {
      const message = `No notes currently exist. Add the first one!`;
      let divCard = getMessageDiv(message);
  
      $("#note-container .list-group").remove();
      $("#note-container").prepend(divCard);
    };
    
    $(document).on("click", "#home a", () => {
      setActive("#home");
  
      const url = "/api/home";
      console.log("GET request: " + url);
  
      $.ajax(url, {
        type: "GET"
      })
      .then(results => $(".content").html(results)
      )
      .fail(error => console.error(error));
    });
  
    $(document).on("click", "#saved a", () => {
      setActive("#saved");
  
      const url = "/api/saved";
      console.log("GET request: " + url);
  
      $.ajax(url, {
        type: "GET"
      })
      .then(results => $(".content").html(results)
      )
      .fail(error => console.error(error));
    });
  
    $(document).on("click", "#scrape a", () => {
      setActive("#home");
  
      const url = "/api/scrape";
      console.log("GET request: " + url);
  
      $.ajax(url, {
        type: "GET"
      })
      .then(results => {
        $(".content").html(results);
        const numScraped = $(".headlines").data("scraped");
        const message = numScraped > 0 
                        ? `${numScraped} new articles were added!`
                        : `No new articles were added! Please check again later.`;
  
        const modalTxt = $('<h4>').text(message);
        $("#scrapedModal .modal-body").append(modalTxt);
        $("#scrapedModal").modal("show");
      })
      .fail(error => console.error(error));
    });
  
    $(document).on("click", ".hl-save", function() {
      const dataObj = { id: $(this).closest(".card").data("id"),
                        saved: true };
      const url = "/api/update";
      console.log("PUT request: " + url);
  
      $.ajax(url, {
        type: "PUT",
        data: dataObj
      })
      .then(results => {
        $(this).closest(".headline").remove();
        if (!($(".headlines").has(".headline").length)) {
          addNoHeadlinesMessage(`No headlines currently exist. Please save articles to add them!`);
        }
      })
      .fail(error => console.error(error));
    });
  
    $(document).on("click", ".hl-nosave", function() {
      const dataObj = { id: $(this).closest(".card").data("id"),
                        saved: false };
      const url = "/api/update";
      console.log("PUT request: " + url);
  
      $.ajax(url, {
        type: "PUT",
        data: dataObj
      })
      .then(results => {
        $(this).closest(".headline").remove();
        if (!($(".headlines").has(".headline").length)) {
          addNoHeadlinesMessage(`No headlines currently exist. Please save articles to add them!`);
        }
      })
      .fail(error => console.error(error));
    });
  
    $(document).on("click", ".hl-delete", function() {
      const dataObj = { id: $(this).closest(".card").data("id") };
      const url = "/api/delete";
      console.log("DELETE request: " + url);
  
      $.ajax(url, {
        type: "DELETE",
        data: dataObj
      })
      .then(results => {
        $(this).closest(".headline").remove();
        if (!($(".headlines").has(".headline").length)) {
          addNoHeadlinesMessage(`No headlines currently exist. Please scrape articles to add them!`);
        }
      })
      .fail(error => console.error(error));
    });
  
    $(document).on("click", ".hl-notes", function() {
      getNotes($(this).closest(".card").data("id"));
    });
  
    $(document).on("click", ".add-notes", () => {
      const author = $("#note-name").val().trim();
      const body   = $("#note-body").val().trim();
  
      if (author && body) {
        const dataObj = { author: author, body: body };
  
        const id = $("#add-note-form").data("id");
        const url = `/api/notes/add/${id}`;
        console.log("POST request: " + url);
  
        $.ajax(url, {
          type: "POST",
          data: dataObj
        })
        .then(results => getNotes(id))
        .fail(error => console.error(error));
      }
    });
  
    $(document).on("click", ".note-delete", function() {
      const dataObj = { id: $(this).closest(".card").data("id") };
      const url = "/api/notes/delete";
      console.log("DELETE request: " + url);
  
      $.ajax(url, {
        type: "DELETE",
        data: dataObj
      })
      .then(results => {
        $(this).closest(".list-group-item").remove();
        if (!($("#note-container").has(".list-group-item").length)) {
          addNoNotesMessage();
        }
      })
      .fail(error => console.error(error));
    });
  });