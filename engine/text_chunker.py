"""
VOXAR Text Chunker
Splits long scripts into manageable chunks for XTTS v2 generation.
Handles sentence boundaries, paragraph breaks, and edge cases.
"""

import re
import os
import logging
from pydub import AudioSegment

logger = logging.getLogger("VoxarChunker")


class TextChunker:
    """
    Splits text into chunks that XTTS v2 can handle without
    quality degradation. Respects sentence boundaries.
    """

    def __init__(self, max_chunk_size=350):
        """
        Args:
            max_chunk_size: Maximum characters per chunk.
                            XTTS v2 handles 250-400 chars well.
                            Beyond 400, quality can degrade.
        """
        self.max_chunk_size = max_chunk_size

    def split_text(self, text):
        """
        Split text into chunks at natural boundaries.

        Priority:
        1. Paragraph breaks (\\n\\n)
        2. Sentence endings (. ! ?)
        3. Commas (,)
        4. Spaces (last resort)

        Returns:
            list of text chunks
        """
        if not text or not text.strip():
            return []

        # Clean the text
        text = text.strip()
        text = re.sub(r'\n{3,}', '\n\n', text)  # Normalize multiple newlines
        text = re.sub(r' {2,}', ' ', text)       # Normalize multiple spaces

        # If text fits in one chunk, return as-is
        if len(text) <= self.max_chunk_size:
            return [text]

        # First, split by paragraphs
        paragraphs = text.split('\n\n')
        
        chunks = []
        for paragraph in paragraphs:
            paragraph = paragraph.strip()
            if not paragraph:
                continue

            if len(paragraph) <= self.max_chunk_size:
                chunks.append(paragraph)
            else:
                # Split paragraph into sentences
                sentence_chunks = self._split_by_sentences(paragraph)
                chunks.extend(sentence_chunks)

        # Validate no chunk is empty
        chunks = [c.strip() for c in chunks if c.strip()]

        logger.info(
            f"Split {len(text)} chars into {len(chunks)} chunks "
            f"(avg {sum(len(c) for c in chunks) // max(len(chunks), 1)} chars/chunk)"
        )

        return chunks

    def _split_by_sentences(self, text):
        """Split text by sentence boundaries."""
        # Split at sentence endings followed by space
        # Handles: . ! ? ... and combinations
        sentences = re.split(r'(?<=[.!?])\s+', text)

        chunks = []
        current_chunk = ""

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            # Check if adding this sentence exceeds limit
            test_chunk = (current_chunk + " " + sentence).strip() if current_chunk else sentence

            if len(test_chunk) <= self.max_chunk_size:
                current_chunk = test_chunk
            else:
                # Save current chunk if it has content
                if current_chunk:
                    chunks.append(current_chunk)

                # Check if single sentence is too long
                if len(sentence) > self.max_chunk_size:
                    sub_chunks = self._split_long_sentence(sentence)
                    chunks.extend(sub_chunks)
                    current_chunk = ""
                else:
                    current_chunk = sentence

        # Don't forget the last chunk
        if current_chunk.strip():
            chunks.append(current_chunk.strip())

        return chunks

    def _split_long_sentence(self, sentence):
        """Split a single sentence that exceeds max_chunk_size."""
        # Try splitting by commas first
        parts = sentence.split(', ')
        
        if len(parts) > 1:
            chunks = []
            current = ""
            
            for part in parts:
                test = (current + ", " + part).strip(", ") if current else part
                
                if len(test) <= self.max_chunk_size:
                    current = test
                else:
                    if current:
                        chunks.append(current)
                    
                    if len(part) > self.max_chunk_size:
                        # Last resort: split by space
                        word_chunks = self._split_by_words(part)
                        chunks.extend(word_chunks)
                        current = ""
                    else:
                        current = part
            
            if current.strip():
                chunks.append(current.strip())
            
            return chunks
        else:
            # No commas, split by words
            return self._split_by_words(sentence)

    def _split_by_words(self, text):
        """Last resort: split by words to fit max_chunk_size."""
        words = text.split()
        chunks = []
        current = ""

        for word in words:
            test = (current + " " + word).strip() if current else word
            
            if len(test) <= self.max_chunk_size:
                current = test
            else:
                if current:
                    chunks.append(current)
                current = word

        if current.strip():
            chunks.append(current.strip())

        return chunks

    def get_chunk_info(self, text):
        """
        Get information about how text would be chunked.
        Useful for credit estimation.
        """
        chunks = self.split_text(text)
        return {
            "original_length": len(text),
            "num_chunks": len(chunks),
            "chunk_sizes": [len(c) for c in chunks],
            "average_chunk_size": sum(len(c) for c in chunks) // max(len(chunks), 1),
            "max_chunk_size": max(len(c) for c in chunks) if chunks else 0,
            "chunks": chunks
        }


class AudioConcatenator:
    """
    Concatenates multiple audio files with natural pauses.
    Used after generating audio for each text chunk.
    """

    @staticmethod
    def concatenate(audio_paths, output_path, pause_ms=400, crossfade_ms=50):
        """
        Concatenate audio files with pauses between them.

        Args:
            audio_paths: List of audio file paths
            output_path: Where to save combined audio
            pause_ms: Milliseconds of silence between chunks
            crossfade_ms: Milliseconds of crossfade (0 to disable)

        Returns:
            Path to combined audio file
        """
        if not audio_paths:
            raise ValueError("No audio files to concatenate")

        if len(audio_paths) == 1:
            # Single file, just copy
            audio = AudioSegment.from_file(audio_paths[0])
            audio.export(output_path, format="wav")
            return output_path

        combined = AudioSegment.empty()
        pause = AudioSegment.silent(duration=pause_ms)

        for i, path in enumerate(audio_paths):
            if not os.path.exists(path):
                logger.warning(f"Audio file not found, skipping: {path}")
                continue

            chunk_audio = AudioSegment.from_file(path)

            if i == 0:
                combined = chunk_audio
            else:
                if crossfade_ms > 0 and len(combined) > crossfade_ms and len(chunk_audio) > crossfade_ms:
                    # Add pause then crossfade
                    combined = combined + pause
                    combined = combined.append(chunk_audio, crossfade=crossfade_ms)
                else:
                    combined = combined + pause + chunk_audio

        combined.export(output_path, format="wav")

        duration = len(combined) / 1000.0
        logger.info(
            f"Concatenated {len(audio_paths)} chunks → {duration:.1f}s audio → {output_path}"
        )

        return output_path

    @staticmethod
    def cleanup_temp_files(file_paths):
        """Delete temporary chunk files after concatenation."""
        for path in file_paths:
            try:
                if os.path.exists(path):
                    os.remove(path)
            except OSError as e:
                logger.warning(f"Could not delete temp file {path}: {e}")
                