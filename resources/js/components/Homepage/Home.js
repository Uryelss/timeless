import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "../../../sass/Home.scss";

function Home() {
    return (
        <div className="home">
            <Header />
            <main className="main-content">
                <section className="hero">
                    <h1>
                        <span className="text-part1">give them a home</span>
                        <span className="text-part2">,</span>
                        <span className="text-part3">
                            {" "}
                            gain a friend for life
                        </span>
                    </h1>
                    <button className="adopt-button">ADOPT TODAY</button>
                </section>
                <section className="ways-section">
                    <div className="ways-title">FEW WAYS TO HELP ANIMALS</div>
                    <div className="ways-content">
                        <div className="way-item">
                            <img
                                src="/ADOPT.svg"
                                alt="Adopt a Pet"
                                className="way-image"
                            />
                            <h3>Adopt a Pet</h3>
                            <p>
                                Give a homeless pet a forever home. By adopting,
                                you’re not just saving a life—you’re gaining a
                                loyal companion who will love you
                                unconditionally.
                            </p>
                        </div>
                        <div className="way-item">
                            <img
                                src="/FOSTER.svg"
                                alt="Foster a Pet"
                                className="way-image"
                            />
                            <h3>Foster a Pet</h3>
                            <p>
                                Can’t commit to adoption yet? Fostering provides
                                temporary care for animals in need, helping them
                                adjust and increasing their chances of finding a
                                permanent home.
                            </p>
                        </div>
                        <div className="way-item">
                            <img
                                src="/VOLUNTEER.svg"
                                alt="Volunteer"
                                className="way-image"
                            />
                            <h3>Volunteer</h3>
                            <p>
                                Join our mission by lending your time and
                                skills. Whether it’s helping at events, caring
                                for animals, or supporting our outreach, every
                                bit of help makes a difference.
                            </p>
                        </div>
                    </div>
                </section>
                <section className="product-section">
                    <div className="product-title">ADOPTABLE PETS</div>
                    <div className="product-container">
                        <div className="product-card">
                            <img
                                src="/cat1.jpg"
                                alt="Adoptable Cat"
                                className="product-image"
                            />
                            <h3>Adorable Cat</h3>
                            <p>
                                Meet our sweet cat looking for a loving home.
                                Playful and affectionate, perfect for any
                                family!
                            </p>
                        </div>
                        <div className="product-card">
                            <img
                                src="/dog1.jpg"
                                alt="Adoptable Dog"
                                className="product-image"
                            />
                            <h3>Loyal Dog</h3>
                            <p>
                                This friendly dog is ready to bring joy to your
                                life. Great with kids and other pets!
                            </p>
                        </div>
                        <div className="product-card">
                            <img
                                src="/mouse1.webp"
                                alt="Charming Mouse"
                                className="product-image"
                            />
                            <h3>Charming Mouse</h3>
                            <p>
                                This tiny mouse is full of personality and ready
                                to be your new friend. Perfect for a cozy home!
                            </p>
                        </div>
                        <div className="product-card">
                            <img
                                src="/fish1.jpg"
                                alt="Vibrant Fish"
                                className="product-image"
                            />
                            <h3>Vibrant Fish</h3>
                            <p>
                                This colorful fish will brighten your day with
                                its graceful swimming. Ideal for any aquarium!
                            </p>
                        </div>
                    </div>
                    <button className="see-all-button">See All</button>
                </section>
                <section className="volunteer-section">
                    <div className="volunteer-title">Become a Volunteer</div>
                    <div className="volunteer-content">
                        <img
                            src="/vounteer1.webp"
                            alt="Volunteer with Pawfect Match"
                            className="volunteer-image"
                        />
                        <p>
                            When you volunteer with Pawfect Match, you’re not
                            just giving your time — you’re giving hope. Whether
                            it’s helping at adoption events, caring for animals
                            at the shelter, or assisting with community
                            outreach, your contribution changes lives.
                        </p>
                        <button className="join-volunteer-button">
                            Join as a Volunteer
                        </button>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default Home;
