import { useEffect, useState } from 'react'
import './App.css'

function App() {

  const [word, setWord] = useState({
    _id: '',
    scramble: 'Loading...',
    unscramble: '',
    level: 'Unknown',
    score: 100,
    time: 0,
    array: '',
    isGameActive: false
  });

  const unscrambledFn = (e) => {
    const input = e.target.value;
    setWord(prev => ({ ...prev, unscramble: input }));
  };

  // To fetch scrambled words on initial render
  useEffect(() => {
    const fetchWords = async () => {
      try {
        // const response = await fetch("http://localhost:3000/api/fetch", {
        const response = await fetch("https://all-real-scramble-backend.onrender.com/api/fetch", {
          method: 'GET',
          headers: {
            "Content-type": "application/json"
          }
        });

        const result = await response.json();
        // console.log("Response from backend:", result);
        if (result) {
          setWord(prev => ({ ...prev, array: result.data }));
        }
      } catch (error) {
        console.error("Error sending request:", error);
      }
    };
    fetchWords();
  }, []);

  const random_number_helper = (length) => {
    // console.log("length:", length);
    const max = length;
    const random = Math.floor(Math.random() * max);
    return random;
  }

  const handleRefresh = () => {
    const random_number = random_number_helper(word.array.length);
    const random_word = word.array[random_number];
    // console.log("random_word:", random_word);
    setWord(prev => ({
      ...prev,
      _id: random_word._id,
      unscramble: '',
      scramble: random_word.scrambled,
      level: random_word.level,
      score: 100,
      isGameActive: true,
      time: 0
    }));
  };

  // To give score, based on how faster the word/sentence framed
  useEffect(() => {
    if (!word.isGameActive) return; // Do not turn on scoring until game is active

    const scoreInterval = setInterval(() => {
      setWord(prev => ({
        ...prev,
        score: prev.score > 0 ? prev.score - 1 : 0,
        time: prev.time + 1
      }));
    }, 1000);

    return () => {
      clearInterval(scoreInterval);
    }
  }, [word.isGameActive]); // it runs when isGameActive changes

  const handleSubmit = async () => {
    if (!word.unscramble || !word.score && !word.time) {
      alert("Please enter the unscrambled word/sentence");
      return;
    }

    try {
      // const response = await fetch("http://localhost:3000/api/verify", {
      const response = await fetch("https://all-real-scramble-backend.onrender.com/api/verify", {
        method: 'POST',
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          selected_id: word._id,
          typedAnswer: word.unscramble,
          score: word.score,
          completionTime: word.time
        })
      });

      if (!response.ok) {
        // console.error("Server error:", response.status, response.statusText);
        const data = await response.json();
        alert(`${data.message}`)
        return;
      }

      const { data } = await response.json();
      // console.log("Response from backend:", data);
      const random_number = random_number_helper(word.array.length);
      const random_word = word.array[random_number];

      setWord(prev => ({
        ...prev,
        _id: random_word._id,
        unscramble: '',
        scramble: random_word.scrambled,
        level: random_word.level,
        score: 100,
        isGameActive: true,
        time: 0
      }));

      alert(` 
        Your score: ${data.score}
        Time taken: ${data.time}
        Correct answer: ${data.answer}`)
      return;

    } catch (error) {
      // console.error("Error sending request:", error);
      alert(error);
    }
  };

  // useEffect(() => {
  //   console.log("score:", word.score, word.time);
  // }, [word.score]);

  return (
    <>
      {/* {console.log("rendered")} */}
      <main className='scramble-main'>
        <div>
          <h2 style={{ margin: '0' }}>Word-scrambling challenge</h2>
          <h3 style={{ color: '#FAFA33' }}>
            {word?.scramble?.length > 10 ? word.scramble.toLowerCase()
              :
              word.scramble.toUpperCase()}</h3>
        </div>

        <div>
          <input type="text"
            name="unscramble"
            value={word.unscramble}
            onChange={unscrambledFn}
            style={{ width: '90%', height: '2vw' }}
            placeholder='Type the unscrambled word here...' />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '0',
            justifyContent: 'space-around'
          }}>
            <p>Difficulty level:</p>
            <h3 style={{ color: '#FAFA33' }}>{word?.level}</h3>
            <p>Time: <span style={{ fontWeight: 'bold' }}>{word.time} seconds</span></p>
          </div>
        </div>

        <h5 style={{
          padding: '1em 0',
          margin: '0 auto',
          width: '70%',
          textAlign: 'center',
        }}>Click Refresh button to load&nbsp;
          <span style={{
            color: '#FAFA33',
          }}
          >'Scrambled word and Difficulty level'</span></h5>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
          <button type="button" onClick={handleRefresh}>Refresh</button>
          <p>Score: <span style={{ fontWeight: 'bold' }}>{word.score}</span></p>
          <button type="submit" onClick={handleSubmit}>Submit</button>
        </div>
      </main>
    </>
  )
}

export default App
