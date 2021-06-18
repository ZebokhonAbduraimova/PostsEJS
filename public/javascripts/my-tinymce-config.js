tinymce.init({
  selector: "#tinyMCE__addPost",
  height: 500,
  menubar: false,
  plugins: [
    "advlist autolink lists link image charmap print preview anchor",
    "searchreplace visualblocks code fullscreen",
    "insertdatetime media table paste code help wordcount",
  ],
  toolbar:
    "undo redo | formatselect | " +
    "bold italic backcolor | alignleft aligncenter " +
    "alignright alignjustify | bullist numlist outdent indent | " +
    "removeformat | help",
});

tinymce.init({
  selector: "#tinyMCE__ediPost",
  height: 500,
  menubar: false,
  plugins: [
    "advlist autolink lists link image charmap print preview anchor",
    "searchreplace visualblocks code fullscreen",
    "insertdatetime media table paste code help wordcount",
  ],
  toolbar:
    "undo redo | formatselect | " +
    "bold italic backcolor | alignleft aligncenter " +
    "alignright alignjustify | bullist numlist outdent indent | " +
    "removeformat | help",
  setup: function (editor) {
    editor.on("init", function (evt) {
      const post = JSON.parse(
        document.querySelector("#hiddenPostToEdit").value
      );
      editor.setContent(post.content);
    });
  },
});
