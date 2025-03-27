import "../style.css";

import NotesWall from "./notesWall";

class StickyNotesApp {
  #notesWall;
  #notesWallElement;
  #inputNewNote;

  constructor() {
    this.#notesWall = new NotesWall();
    this.#notesWallElement = document.getElementById("notes-wall");
    this.#inputNewNote = document.getElementById("new-note");

    this.#inputNewNote.addEventListener(
      "keydown",
      this.#handleKeyDownToCreateNewNote,
    );

    this.#notesWallElement.addEventListener(
      "dblclick",
      this.#handleDoubleClickOnNoteElement.bind(this),
    );

    this.#notesWallElement.addEventListener(
      "keydown",
      this.#handleKeyDownToSaveNote.bind(this),
    );

    this.#notesWallElement.addEventListener(
      "blur",
      this.#handleBlurToSaveNote.bind(this),
      true,
    );

    this.#notesWallElement.addEventListener(
      "click",
      this.#handleClickOnRemoveNoteButton.bind(this),
    );

    document.addEventListener("DOMContentLoaded", this.#renderNotes.bind(this));
  }

  // Helper Function to create note text element
  #createNoteText(note) {
    const noteText = document.createElement("div");
    noteText.id = `note-text-${note.id}`;
    noteText.classList.add("p-4", "note-text");
    noteText.innerText = note.text;
    return noteText;
  }

  // Helper Function to create note edit textarea element
  #createNoteTextarea(note) {
    const noteEdit = document.createElement("textarea");
    noteEdit.id = `note-textarea-${note.id}`;
    noteEdit.classList.add(
      "absolute",
      "top-0",
      "left-0",
      "hidden",
      "w-full",
      "h-full",
      "p-4",
      "transition-transform",
      "transform",
      "bg-yellow-300",
      "shadow-xl",
      "resize-none",
      "outline-rose-700",
      "outline-offset-0",
      "note-edit",
      "note",
      "hover:scale-105",
    );
    noteEdit.value = note.text;
    return noteEdit;
  }

  // Helper Function to create a remove button
  #createNoteRemoveButton(note) {
    const noteRemoveButton = document.createElement("button");
    noteRemoveButton.id = `note-delete-btn-${note.id}`;
    noteRemoveButton.classList.add(
      "absolute",
      "w-5",
      "h-5",
      "leading-5",
      "text-center",
      "transition-opacity",
      "opacity-0",
      "cursor-pointer",
      "delete-btn",
      "top-1",
      "right-1",
      "hover:opacity-100",
    );
    noteRemoveButton.innerText = "🗑";
    return noteRemoveButton;
  }

  // Helper Function to create a note item
  #createNoteItem(note) {
    const noteItem = document.createElement("div");
    noteItem.id = `note-item-${note.id}`;
    noteItem.classList.add(
      "relative",
      "w-40",
      "h-40",
      "p-0",
      "m-2",
      "overflow-y-auto",
      "transition-transform",
      "transform",
      "bg-yellow-200",
      "shadow-lg",
      "note",
      "hover:scale-105",
    );
    noteItem.style.overflow = "hidden";
    const noteRemoveButton = this.#createNoteRemoveButton(note);
    const noteText = this.#createNoteText(note);
    const noteEdit = this.#createNoteTextarea(note);
    noteItem.append(noteRemoveButton, noteText, noteEdit);
    return noteItem;
  }

  // Function to render the notes
  #renderNotes() {
    this.#notesWallElement.innerHTML = "";
    const notesElements = this.#notesWall
      .getNotes()
      .map(this.#createNoteItem.bind(this));
    this.#notesWallElement.append(...notesElements);
  }

  // Event handler to create a new note item
  #handleKeyDownToCreateNewNote = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const noteText = event.target.value.trim();
      if (noteText) {
        this.#notesWall.addNote(noteText);
        event.target.value = ""; // Clear the input
        this.#renderNotes();
      }
    } else if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      const noteText = event.target;
      const cursorPosition = noteText.selectionStart;
      noteText.value =
        noteText.value.substring(0, cursorPosition) +
        "\n" +
        noteText.value.substring(cursorPosition);
      noteText.selectionStart = noteText.selectionEnd = cursorPosition + 1;
    }
  };

  // Event handler to edit a note item
  #handleDoubleClickOnNoteElement = (event) => {
    const noteItem = event.target.closest(".note");
    if (noteItem) {
      document.querySelectorAll(".note-edit").forEach((noteEdit) => {
        noteEdit.style.display = "none";
        noteEdit.previousElementSibling.style.display = "block";
      });

      const noteText = noteItem.querySelector(".note-text");
      const noteEdit = noteItem.querySelector(".note-edit");

      noteText.style.display = "none";
      noteEdit.style.display = "block";
      noteEdit.classList.add("scale-105");
      noteEdit.focus();
    }
  };

  // Event handler to save the note when clicking outside or pressing Enter/Escape
  #handleBlurToSaveNote = (event) => {
    if (event.target.classList.contains("note-edit")) {
      const noteText = event.target.value.trim();
      const noteId = this.#findTargetNoteElement(event.target);
      const noteIdNumber = this.#parseNoteId(noteId);
      if (noteText) {
        this.#notesWall.editNote(noteIdNumber, noteText);
        this.#renderNotes();
      }
    }
  };

  // Event handler to save the edited target note element
  #handleKeyDownToSaveNote = (event) => {
    if (event.target.classList.contains("note-edit")) {
      const noteId = this.#parseNoteId(event.target);
      if (
        (event.key === "Enter" || event.key === "Escape") &&
        !event.shiftKey
      ) {
        event.preventDefault();
        this.#handleBlurToSaveNote(event);
      } else if (event.key === "Enter" && event.shiftKey) {
        event.preventDefault();
        const noteText = event.target;
        const cursorPosition = noteText.selectionStart;
        noteText.value =
          noteText.value.substring(0, cursorPosition) +
          "\n" +
          noteText.value.substring(cursorPosition);
        noteText.selectionStart = noteText.selectionEnd = cursorPosition + 1;
      }
    }
  };

  // Helper function to find the target todo element
  #findTargetNoteElement = (element) => element.closest(".note");

  // Helper function to parse the note id from the note element
  #parseNoteId = (note) => (note ? Number(note.id.split("-").pop()) : -1);

  // Event handler to remove the note
  #handleClickOnRemoveNoteButton = (event) => {
    if (event.target.id.startsWith("note-delete-btn-")) {
      const noteId = this.#findTargetNoteElement(event.target);
      const noteIdNumber = this.#parseNoteId(noteId);
      this.#notesWall.removeNote(noteIdNumber);
      this.#renderNotes();
    }
  };
}

new StickyNotesApp();
