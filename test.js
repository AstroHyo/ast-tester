import "../style.css";
import NotesWall from "./notesWall";
/////
// Constants for class names and IDs
const NOTE_CLASS = "note";
const NOTE_TEXT_CLASS = "note-text";
const NOTE_EDIT_CLASS = "note-edit";
const DELETE_BTN_CLASS = "delete-btn";

class StickyNotesApp {
  #notesWall;
  #notesWallElement;
  #inputNewNote;

  constructor() {
    this.#notesWall = new NotesWall();
    this.#notesWallElement = document.getElementById("notes-wall");
    this.#inputNewNote = document.getElementById("new-note");

    // Event listeners using arrow functions (no need to bind)
    this.#inputNewNote.addEventListener("keydown", this.#handleKeyDownToCreateNewNote);
    this.#notesWallElement.addEventListener("dblclick", this.#handleDoubleClickOnNoteElement);
    this.#notesWallElement.addEventListener("keydown", this.#handleKeyDownToSaveNote);
    this.#notesWallElement.addEventListener("blur", this.#handleBlurToSaveNote, true);
    this.#notesWallElement.addEventListener("click", this.#handleClickOnRemoveNoteButton);

    document.addEventListener("DOMContentLoaded", this.#renderNotes);
  }

  // Helper to create note text element
  #createNoteText = (note) => {
    const noteText = document.createElement("div");
    noteText.id = `note-text-${note.id}`;
    noteText.classList.add("p-4", NOTE_TEXT_CLASS);
    noteText.innerText = note.text;
    return noteText;
  };

  // Helper to create note edit textarea element
  #createNoteTextarea = (note) => {
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
      NOTE_EDIT_CLASS,
      NOTE_CLASS,
      "hover:scale-105"
    );
    noteEdit.value = note.text;
    return noteEdit;
  };

  // Helper to create a remove button
  #createNoteRemoveButton = (note) => {
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
      DELETE_BTN_CLASS,
      "top-1",
      "right-1",
      "hover:opacity-100"
    );
    noteRemoveButton.innerText = "🗑";
    return noteRemoveButton;
  };

  // Helper to create a complete note item
  #createNoteItem = (note) => {
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
      NOTE_CLASS,
      "hover:scale-105"
    );
    noteItem.style.overflow = "hidden";

    const noteRemoveButton = this.#createNoteRemoveButton(note);
    const noteText = this.#createNoteText(note);
    const noteEdit = this.#createNoteTextarea(note);
    noteItem.append(noteRemoveButton, noteText, noteEdit);
    return noteItem;
  };

  // Render all notes using a document fragment for better performance
  #renderNotes = () => {
    this.#notesWallElement.innerHTML = "";
    const fragment = document.createDocumentFragment();
    this.#notesWall.getNotes().forEach((note) => {
      fragment.appendChild(this.#createNoteItem(note));
    });
    this.#notesWallElement.appendChild(fragment);
  };

  // Handler to create a new note item on Enter (without Shift)
  #handleKeyDownToCreateNewNote = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const noteText = event.target.value.trim();
      if (noteText) {
        this.#notesWall.addNote(noteText);
        event.target.value = "";
        this.#renderNotes();
      }
    } else if (event.key === "Enter" && event.shiftKey) {
      // Insert a newline at the cursor position when Shift+Enter is pressed
      event.preventDefault();
      const cursorPosition = event.target.selectionStart;
      event.target.value =
        event.target.value.substring(0, cursorPosition) +
        "\n" +
        event.target.value.substring(cursorPosition);
      event.target.selectionStart = event.target.selectionEnd = cursorPosition + 1;
    }
  };

  // Handler to enable note editing on double click
  #handleDoubleClickOnNoteElement = (event) => {
    const noteItem = event.target.closest(`.${NOTE_CLASS}`);
    if (noteItem) {
      // Hide all edit areas and show their corresponding note texts
      document.querySelectorAll(`.${NOTE_EDIT_CLASS}`).forEach((noteEdit) => {
        noteEdit.style.display = "none";
        noteEdit.previousElementSibling.style.display = "block";
      });

      const noteText = noteItem.querySelector(`.${NOTE_TEXT_CLASS}`);
      const noteEdit = noteItem.querySelector(`.${NOTE_EDIT_CLASS}`);
      noteText.style.display = "none";
      noteEdit.style.display = "block";
      noteEdit.classList.add("scale-105");
      noteEdit.focus();
    }
  };

  // Handler to save a note on blur event
  #handleBlurToSaveNote = (event) => {
    if (event.target.classList.contains(NOTE_EDIT_CLASS)) {
      const updatedText = event.target.value.trim();
      const noteItem = event.target.closest(`.${NOTE_CLASS}`);
      const noteId = this.#parseNoteId(noteItem);
      if (updatedText) {
        this.#notesWall.editNote(noteId, updatedText);
        this.#renderNotes();
      }
    }
  };

  // Handler to save the edited note on Enter/Escape keydown
  #handleKeyDownToSaveNote = (event) => {
    if (event.target.classList.contains(NOTE_EDIT_CLASS)) {
      if ((event.key === "Enter" || event.key === "Escape") && !event.shiftKey) {
        event.preventDefault();
        this.#handleBlurToSaveNote(event);
      } else if (event.key === "Enter" && event.shiftKey) {
        // Insert a newline at the cursor position for Shift+Enter
        event.preventDefault();
        const cursorPosition = event.target.selectionStart;
        event.target.value =
          event.target.value.substring(0, cursorPosition) +
          "\n" +
          event.target.value.substring(cursorPosition);
        event.target.selectionStart = event.target.selectionEnd = cursorPosition + 1;
      }
    }
  };

  // Parses the note ID from the note element's id attribute
  #parseNoteId = (noteElement) =>
    noteElement ? Number(noteElement.id.split("-").pop()) : -1;

  // Handler to remove the note when the remove button is clicked
  #handleClickOnRemoveNoteButton = (event) => {
    if (event.target.id.startsWith("note-delete-btn-")) {
      const noteItem = event.target.closest(`.${NOTE_CLASS}`);
      const noteId = this.#parseNoteId(noteItem);
      this.#notesWall.removeNote(noteId);
      this.#renderNotes();
    }
  };
}

new StickyNotesApp();
