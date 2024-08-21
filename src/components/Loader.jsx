import loader from '../assets/loader.gif';

const Loader = () => {
  return (
    <div className="h-screen w-screen grid place-content-center">
          <img src={loader} alt="loader" />
        </div>
  )
}

export default Loader