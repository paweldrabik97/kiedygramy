import React from 'react'
import SubmitButton from '../components/ui/SubmitButton.jsx'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addGame } from '../features/games/services/games.ts';


const NewGamePage = () => {

    // State for form inputs
    const [formData, setFormData] = useState({
        gameName: '',
        genre: '',
        minPlayers: '',
        maxPlayers: ''
    });

    // States for UI feedback
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Navigation hook
    const navigate = useNavigate();

    // Handler for text input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handler for form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if(!formData.gameName) {
            setError("Nazwa gry jest wymagana");
            return;
        }

        setLoading(true);
        try {
            await addGame({
                title: formData.gameName,
                genre: formData.genre,
                minPlayers: formData.minPlayers,
                maxPlayers: formData.maxPlayers
            });
            navigate('/games');
        } catch (err) {
            setError(`Dodanie gry nie powiodło się. Spróbuj ponownie. ${err}`);
            console.error("Dodanie gry nie powiodło się:", err);
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className='z-10 absolute left-1/2 -translate-x-1/2 m-auto top-1/2 -translate-y-1/2 bg-gray-200 p-10 rounded-lg shadow-lg text-black'>
        <div>
            <h1>Dodaj nową grę</h1>
        </div>
        <div>
            <div>
                <form>
                    <div>
                        <label htmlFor='gameName'>Nazwa gry:</label>
                        <input type="text" id="gameName" name="gameName" value={formData.gameName} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label htmlFor='genre'>Gatunek:</label>
                        <input type="text" id="genre" name="genre" value={formData.genre} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label htmlFor='minPlayers'>Minimalna liczba graczy:</label>
                        <input type="number" id="minPlayers" name="minPlayers" value={formData.minPlayers} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label htmlFor='maxPlayers'>Maksymalna liczba graczy:</label>
                        <input type="number" id="maxPlayers" name="maxPlayers" value={formData.maxPlayers} onChange={handleInputChange} />
                    </div>
                    <SubmitButton onClick={handleSubmit}>Dodaj Grę</SubmitButton>
                </form>
            </div>
        </div>
    </div>
  )
}

export default NewGamePage