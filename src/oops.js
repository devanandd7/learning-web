import React, { useState, useEffect, useRef } from 'react';

// Load Mermaid library dynamically
const loadMermaid = () => {
  if (window.mermaid) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js';
    script.onload = () => {
      window.mermaid.initialize({ startOnLoad: true, theme: 'default' });
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Load Marked (Markdown parser) library dynamically
const loadMarked = () => {
  if (window.marked) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    script.onload = () => {
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Markdown Renderer Component
const MarkdownRenderer = ({ content }) => {
  const [markedLoaded, setMarkedLoaded] = useState(false);

  useEffect(() => {
    loadMarked().then(() => {
      setMarkedLoaded(true);
    }).catch(error => console.error("Failed to load Marked:", error));
  }, []);

  if (!markedLoaded) {
    return <p className="text-gray-600">Loading content...</p>;
  }

  // Use marked.parse to convert markdown to HTML
  const htmlContent = window.marked ? window.marked.parse(content) : content;

  return <div className="prose max-w-none text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};


// Mermaid component to render diagrams
const Mermaid = ({ chart }) => {
  const mermaidRef = useRef(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  useEffect(() => {
    loadMermaid().then(() => {
      setMermaidLoaded(true);
    }).catch(error => console.error("Failed to load Mermaid:", error));
  }, []);

  useEffect(() => {
    if (mermaidLoaded && mermaidRef.current && chart) {
      try {
        window.mermaid.render('graphDiv', chart).then(({ svg }) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        }).catch(error => {
          console.error("Mermaid rendering failed:", error);
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `<p class="text-red-500">Error rendering diagram. Check Mermaid syntax.</p>`;
          }
        });
      } catch (e) {
        console.error("Mermaid render error:", e);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `<p class="text-red-500">Error rendering diagram. Check Mermaid syntax.</p>`;
        }
      }
    }
  }, [chart, mermaidLoaded]);

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-inner mt-4">
      <h3 className="text-xl font-semibold mb-2 text-gray-800">Mermaid Diagram</h3>
      <div ref={mermaidRef} className="mermaid flex justify-center items-center overflow-x-auto">
        {!mermaidLoaded && <p className="text-gray-600">Loading Mermaid...</p>}
      </div>
    </div>
  );
};

// Component to render a styled differences table
const DifferencesTable = ({ headers, rows }) => {
  if (!headers || !rows || rows.length === 0) {
    return null; // Don't render if no data
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-md border border-yellow-200">
      <table className="min-w-full divide-y divide-yellow-300 bg-white">
        <thead className="bg-yellow-100">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-bold text-yellow-800 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-yellow-200">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-yellow-50'}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-6 py-4 whitespace-normal text-sm text-gray-800"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Quiz Component
const Quiz = ({ question, options, answer }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (selectedOption === null) {
      setFeedback('Please select an option.');
      return;
    }
    if (selectedOption === answer) {
      setFeedback('Correct! 🎉');
    } else {
      setFeedback(`Incorrect. The correct answer is: ${answer}`);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setFeedback('');
  };

  return (
    <div className="bg-orange-50 p-6 rounded-xl shadow-inner">
      <h3 className="text-2xl font-semibold mb-3 text-orange-700">Quick Check Quiz</h3>
      <p className="text-lg font-medium mb-4 text-gray-800">{question}</p>
      <div className="space-y-2">
        {options.map((option, index) => (
          <label key={index} className="flex items-center text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="quiz-option"
              value={option}
              checked={selectedOption === option}
              onChange={() => setSelectedOption(option)}
              className="form-radio h-5 w-5 text-orange-600 transition duration-150 ease-in-out"
            />
            <span className="ml-3 text-base">{option}</span>
          </label>
        ))}
      </div>
      <div className="mt-6 flex space-x-4">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg shadow-md hover:bg-orange-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75"
        >
          Submit Answer
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg shadow-md hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
        >
          Reset
        </button>
      </div>
      {feedback && (
        <p className={`mt-4 text-lg font-semibold ${feedback.includes('Correct') ? 'text-green-600' : 'text-red-600'}`}>
          {feedback}
        </p>
      )}
    </div>
  );
};

// Video Slider Component
const VideoSlider = ({ kunalVideoId, striverVideoId }) => {
  const [currentVideo, setCurrentVideo] = useState('kunal'); // 'kunal' or 'striver'

  // Set initial video based on availability
  useEffect(() => {
    if (kunalVideoId) {
      setCurrentVideo('kunal');
    } else if (striverVideoId) {
      setCurrentVideo('striver');
    }
  }, [kunalVideoId, striverVideoId]);

  const handleSlide = (direction) => {
    if (direction === 'left') {
      setCurrentVideo('striver');
    } else {
      setCurrentVideo('kunal');
    }
  };

  const showKunalButton = kunalVideoId;
  const showStriverButton = striverVideoId;

  return (
    <div className="bg-blue-100 p-6 rounded-xl shadow-inner text-center">
      <h3 className="text-2xl font-semibold mb-4 text-blue-700">Relevant YouTube Videos</h3>
      <div className="flex justify-center items-center space-x-4 mb-4">
        {showKunalButton && (
          <button
            onClick={() => handleSlide('right')}
            disabled={currentVideo === 'kunal'}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out
              ${currentVideo === 'kunal'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 hover:text-indigo-900'
              }
              ${!showKunalButton ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Show Kunal's Video
          </button>
        )}
        {showStriverButton && (
          <button
            onClick={() => handleSlide('left')}
            disabled={currentVideo === 'striver'}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out
              ${currentVideo === 'striver'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 hover:text-indigo-900'
              }
              ${!showStriverButton ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Show Striver's Video
          </button>
        )}
      </div>

      <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-lg">
        {kunalVideoId && currentVideo === 'kunal' && (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${kunalVideoId}`}
            title="Kunal Kushwaha YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        )}
        {striverVideoId && currentVideo === 'striver' && (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${striverVideoId}`}
            title="Striver YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        )}

        {!kunalVideoId && !striverVideoId && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-700">
              No relevant videos found for this topic.
            </div>
        )}
        {(currentVideo === 'kunal' && !kunalVideoId) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-700">
              Kunal's video not available for this topic.
            </div>
        )}
        {(currentVideo === 'striver' && !striverVideoId) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-700">
              Striver's video not available for this topic.
            </div>
        )}
      </div>
    </div>
  );
};

// Glossary Content
const glossaryContent = {
  title: "OOP Glossary",
  terms: [
    { term: "Class", definition: "A blueprint or template for creating objects, defining their properties and behaviors." },
    { term: "Object", definition: "An instance of a class; a concrete entity created from a class blueprint that occupies memory." },
    { term: "Encapsulation", definition: "Bundling data and methods that operate on the data into a single unit (class), and restricting direct access to the data." },
    { term: "Inheritance", definition: "A mechanism where one class (subclass) acquires properties and behaviors from another class (superclass), promoting code reusability and an 'is-a' relationship." },
    { term: "Polymorphism", definition: "Meaning 'many forms', it allows objects of different classes to be treated as objects of a common type, achieved through method overloading (compile-time) and method overriding (runtime)." },
    { term: "Abstraction", definition: "Hiding complex implementation details and showing only essential features, achieved using abstract classes and interfaces." },
    { term: "Constructor", definition: "A special method used to initialize objects when they are created." },
    { term: "Method Overloading", definition: "Defining multiple methods in the same class with the same name but different parameters." },
    { term: "Method Overriding", definition: "A subclass providing a specific implementation for a method already defined in its superclass." },
    { term: "Superclass", definition: "The parent class whose properties and methods are inherited." },
    { term: "Subclass", definition: "The child class that inherits properties and methods from a superclass." },
    { term: "Access Modifier", definition: "Keywords (e.g., `public`, `private`, `protected`) that set the accessibility level for classes, fields, methods, and constructors." }
  ]
};


// Content for each OOP topic
const oopContent = {
  intro: {
    title: "Introduction to OOP: Classes & Objects",
    explanation: `
## What is OOP?
Object-Oriented Programming (OOP) is a programming paradigm based on the concept of "objects", which can contain data and code: data in the form of fields (attributes or properties), and code in the form of procedures (methods).

## Key Concepts:
* **Class:** A blueprint or a template for creating objects. It defines the properties (data) and methods (behavior) that all objects of that class will have. Think of it as a cookie cutter.
* **Object:** An instance of a class. It's a concrete entity created from the class blueprint. Each object has its own unique set of values for the properties defined by its class, and it can perform the actions (methods) defined by its class. When an object is created, it occupies a specific block of memory to store its data, making it a "physical entity" in the computer's memory.
    `,
    example: `
// Car.java - Class Definition
class Car {
    // Properties (attributes)
    String make;
    String model;
    String color;
    int year;

    // Constructor to initialize object properties
    public Car(String make, String model, String color, int year) {
        this.make = make;
        this.model = model;
        this.color = color;
        this.year = year;
    }

    // Method (behavior)
    public void startEngine() {
        System.out.println(make + " " + model + " engine started.");
    }

    public void displayInfo() {
        System.out.println("Make: " + make + ", Model: " + model + ", Color: " + color + ", Year: " + year);
    }
}

// Main.java - Creating Objects
public class Main {
    public static void main(String[] args) {
        // Creating objects (instances) of the Car class
        Car myCar = new Car("Toyota", "Camry", "Blue", 2020);
        Car yourCar = new Car("Honda", "Civic", "Red", 2022);

        // Accessing properties and calling methods
        System.out.println("My car's color: " + myCar.color);
        myCar.startEngine();
        myCar.displayInfo();

        System.out.println("Your car's model: " + yourCar.model);
        yourCar.startEngine();
        yourCar.displayInfo();
    }
}
    `,
    mermaid: `
classDiagram
    class Car {
        +String make
        +String model
        +String color
        +int year
        +Car(make, model, color, year)
        +startEngine()
        +displayInfo()
    }
    `,
    differences: {
      headers: ['Feature', 'Class', 'Object'],
      rows: [
        ['Nature', 'Blueprint, template, logical entity', 'Real-world entity, instance, physical entity (in memory)'],
        ['Creation', 'Declared once', 'Can be created multiple times'],
        ['Memory', 'Does not occupy memory (at runtime)', 'Occupies memory when instantiated'],
        ['Example', "'Car' (the concept)", "'myCar' (a specific Toyota Camry)"]
      ]
    },
    tricksAndTips: `
* **Analogy is Key:** Always relate classes to blueprints/cookie cutters and objects to actual buildings/cookies. This visual aid helps solidify the concept.
* **Think "Is-A" vs. "Has-A":** A class *is a* type of data. An object *has a* specific state.
* **Memory Connection:** Remember that objects are the ones that take up space in RAM; classes are just definitions.
    `,
    quiz: {
      question: "Which of the following best describes an 'object' in OOP?",
      options: [
        "A blueprint for creating data types.",
        "A logical entity that defines properties.",
        "A concrete instance of a class that occupies memory.",
        "A collection of methods only."
      ],
      answer: "A concrete instance of a class that occupies memory."
    },
    youtubeVideos: {
      kunal: "BSVKUk58K6U", // Kunal's OOP 1: Introduction & Concepts
      striver: "yWbB3K9d4jY" // Striver's OOP Concepts in 1 Shot (general OOP, covers intro)
    },
    pyq: `
## PYQ: Explain the difference between a class and an object with a real-world example.

### Answer Approach:
1.  **Define Class:** A blueprint, template, or logical entity that defines properties and methods.
2.  **Define Object:** A concrete instance of a class, a real-world entity that occupies memory and has unique state.
3.  **Real-World Example:** Use your "Car" example. The 'Car' class defines what a car is (make, model, color, startEngine method). An 'object' would be your specific "red Toyota Camry" with its own unique values for make, model, color, etc., existing in memory.
    `
  },
  encapsulation: {
    title: "Encapsulation",
    explanation: `
## What is Encapsulation?
**Encapsulation** is one of the fundamental principles of OOP. It refers to the bundling of data (attributes) and methods (functions) that operate on the data into a single unit, or class. It also involves restricting direct access to some of an object's components, which means hiding the internal state of an object and requiring all interaction to be performed through the object's methods.

## Key Aspects:
* **Data Hiding:** Protecting data from direct, unauthorized access. Achieved by declaring attributes as \`private\`.
* **Bundling:** Grouping data and the methods that operate on that data within a single class.
* **Controlled Access:** Providing public methods (getters and setters) to interact with the private data, allowing for validation and logic before data modification.
This is achieved using **access modifiers** (like \`private\`, \`public\`, \`protected\`, \`default\`).
    `,
    example: `
// Student.java
class Student {
    // Private attributes (data hiding)
    private String name;
    private int age;
    private String studentId;

    // Constructor
    public Student(String name, int age, String studentId) {
        this.name = name;
        this.age = age;
        this.studentId = studentId;
    }

    // Public getter methods to access private data
    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }

    public String getStudentId() {
        return studentId;
    }

    // Public setter methods to modify private data (with validation if needed)
    public void setAge(int age) {
        if (age > 0) { // Example of validation
            this.age = age;
            System.out.println("Age updated to: " + age);
        } else {
            System.out.println("Error: Age cannot be negative.");
        }
    }
}

// Main.java
public class Main {
    public static void main(String[] args) {
        Student student1 = new Student("Alice", 20, "S1001");

        // Accessing data using getter methods
        System.out.println("Student Name: " + student1.getName());
        System.out.println("Student Age: " + student1.getAge());

        // Trying to set age using setter
        student1.setAge(21);
        System.out.println("Current Age: " + student1.getAge());

        // Attempting to set an invalid age (will be rejected by setter logic)
        student1.setAge(-5);
        System.out.println("Current Age after invalid attempt: " + student1.getAge());
    }
}
    `,
    mermaid: `
classDiagram
    class Student {
        -String name
        -int age
        -String studentId
        +Student(name, age, studentId)
        +getName() String
        +getAge() int
        +getStudentId() String
        +setAge(age: int) void
    }
    `,
    differences: {
      headers: ['Aspect', 'Description'],
      rows: [
        ['Data Hiding', 'Protecting data from direct, unauthorized access. Achieved by declaring attributes as `private`.'],
        ['Bundling', 'Grouping data and the methods that operate on that data within a single class.'],
        ['Controlled Access', 'Providing public methods (getters and setters) to interact with the private data, allowing for validation and logic before data modification.']
      ]
    },
    tricksAndTips: `
* **Think "Black Box":** Encapsulation is like a black box. You know what it does (its public methods), but you don't need to know how it works internally (its private data and logic).
* **Getters/Setters are Gates:** Imagine getters and setters as controlled gates to your data. They prevent direct manipulation and allow for validation.
* **Security & Control:** Remember it's about protecting data and controlling access to maintain integrity.
    `,
    quiz: {
      question: "What is the primary purpose of making class attributes `private` in Java?",
      options: [
        "To allow direct access from outside the class.",
        "To achieve data hiding and controlled access.",
        "To make them accessible only to subclasses.",
        "To reduce memory consumption."
      ],
      answer: "To achieve data hiding and controlled access."
    },
    youtubeVideos: {
      kunal: "46T2wD3IuhM", // Kunal's OOP 3 (Encapsulation starts at 1:57:02)
      striver: "ubUS0Bqj_lg" // Striver's P35 - Encapsulation in Java
    },
    pyq: `
## PYQ: What is encapsulation in Java? Provide an example demonstrating its use.

### Answer Approach:
1.  **Define Encapsulation:** Bundling data and methods, and data hiding using access modifiers.
2.  **Explain Benefits:** Data integrity, flexibility, easier maintenance.
3.  **Example:** Use the \`Student\` class example with private attributes and public getters/setters to show how data is protected and accessed.
    `
  },
  inheritance: {
    title: "Inheritance",
    explanation: `
## What is Inheritance?
**Inheritance** is a mechanism in Java where one class acquires the properties and behaviors (fields and methods) of another class. The class that inherits is called the **subclass** (or derived class, child class), and the class whose properties are inherited is called the **superclass** (or base class, parent class).

The \`extends\` keyword is used to implement inheritance in Java.

## Key Benefits:
* **Code Reusability:** Subclasses can reuse code from the superclass.
* **"Is-A" Relationship:** Establishes a natural hierarchical relationship (e.g., a Dog *is a* type of Animal).
* **Maintainability:** Changes in the superclass can propagate to subclasses, simplifying updates.
    `,
    example: `
// Animal.java - Superclass
class Animal {
    String name;

    public Animal(String name) {
        this.name = name;
    }

    public void eat() {
        System.out.println(name + " is eating.");
    }

    public void sleep() {
        System.out.println(name + " is sleeping.");
    }
}

// Dog.java - Subclass inheriting from Animal
class Dog extends Animal {
    public Dog(String name) {
        super(name); // Calls the superclass constructor
    }

    public void bark() {
        System.out.println(name + " is barking.");
    }
}

// Cat.java - Subclass inheriting from Animal
class Cat extends Animal {
    public Cat(String name) {
        super(name);
    }

    public void meow() {
        System.out.println(name + " is meowing.");
    }
}

// Main.java
public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog("Buddy");
        myDog.eat();   // Inherited from Animal
        myDog.sleep(); // Inherited from Animal
        myDog.bark();  // Specific to Dog

        Cat myCat = new Cat("Whiskers");
        myCat.eat();   // Inherited from Animal
        myCat.sleep(); // Inherited from Animal
        myCat.meow();  // Specific to Cat
    }
}
    `,
    mermaid: `
classDiagram
    Animal <|-- Dog
    Animal <|-- Cat
    class Animal {
        +String name
        +Animal(name)
        +eat()
        +sleep()
    }
    class Dog {
        +Dog(name)
        +bark()
    }
    class Cat {
        +Cat(name)
        +meow()
    }
    `,
    differences: {
      headers: ['Type of Inheritance', 'Description'],
      rows: [
        ['Single Inheritance', 'A class inherits from only one superclass. (Most common)'],
        ['Multilevel Inheritance', 'A class inherits from a class, which in turn inherits from another class (e.g., A -> B -> C).'],
        ['Hierarchical Inheritance', 'Multiple subclasses inherit from a single superclass.'],
        ['Multiple Inheritance (via Interfaces)', 'Java does not support multiple inheritance of classes (a class cannot extend more than one class), but it supports multiple inheritance of *type* through interfaces.']
      ]
    },
    tricksAndTips: `
* **"Is-A" Test:** If you can say "X is a Y" (e.g., "Dog is an Animal"), then X can likely inherit from Y.
* **Code Reusability:** Think of inheritance as a way to avoid writing the same code multiple times.
* **Hierarchy Visualization:** Draw out class hierarchies to understand the flow of inheritance.
    `,
    quiz: {
      question: "Which keyword is used to implement inheritance in Java?",
      options: [
        "implements",
        "inherits",
        "extends",
        "uses"
      ],
      answer: "extends"
    },
    youtubeVideos: {
      kunal: "46T2wD3IuhM", // Kunal's OOP 3 (Inheritance starts at 0:02:26)
      striver: "XSuybcFfLx4" // CodeWithHarry: Inheritance in Java (relevant and often appears in Striver's community)
    },
    pyq: `
## PYQ: Explain inheritance in Java with a suitable code example. What is the 'is-a' relationship?

### Answer Approach:
1.  **Define Inheritance:** Mechanism for one class to acquire properties/behaviors of another, promoting code reusability.
2.  **Explain 'is-a' Relationship:** A Dog *is an* Animal, a Car *is a* Vehicle. This signifies that the subclass is a specialized type of the superclass.
3.  **Example:** Use the \`Animal\`, \`Dog\`, \`Cat\` example to demonstrate how methods and properties are inherited and extended.
    `
  },
  polymorphism: {
    title: "Polymorphism",
    explanation: `
## What is Polymorphism?
**Polymorphism** means "many forms." In Java, it allows objects of different classes to be treated as objects of a common type. It enables you to define one interface or method and have multiple implementations.

## Types of Polymorphism in Java:
1.  **Compile-time Polymorphism (Method Overloading):**
    * Achieved when there are multiple methods with the same name but different parameters (number, type, or order of arguments) within the same class.
    * The compiler decides which method to call based on the arguments provided.
2.  **Runtime Polymorphism (Method Overriding):**
    * Achieved when a subclass provides a specific implementation for a method that is already defined in its superclass.
    * This is done through inheritance.
    * The JVM determines which method to call at runtime based on the actual object type.
    `,
    example: `
// Shape.java - Superclass for Overriding
class Shape {
    public void draw() {
        System.out.println("Drawing a generic shape.");
    }
}

// Circle.java - Subclass overriding draw()
class Circle extends Shape {
    @Override // Annotation to indicate overriding
    public void draw() {
        System.out.println("Drawing a Circle.");
    }
}

// Rectangle.java - Subclass overriding draw()
class Rectangle extends Shape {
    @Override
    public void draw() {
        System.out.println("Drawing a Rectangle.");
    }
}

// Calculator.java - For Overloading
class Calculator {
    // Method Overloading: same method name, different parameters
    public int add(int a, int b) {
        return a + b;
    }

    public int add(int a, int b, int c) {
        return a + b + c;
    }

    public double add(double a, double b) {
        return a + b;
    }
}

// Main.java
public class Main {
    public static void main(String[] args) {
        // Runtime Polymorphism (Method Overriding)
        Shape s1 = new Circle();    // Shape reference, Circle object
        Shape s2 = new Rectangle(); // Shape reference, Rectangle object

        s1.draw(); // Calls Circle's draw()
        s2.draw(); // Calls Rectangle's draw()

        // Compile-time Polymorphism (Method Overloading)
        Calculator calc = new Calculator();
        System.out.println("Sum of 2 integers: " + calc.add(5, 10));
        System.out.println("Sum of 3 integers: " + calc.add(5, 10, 15));
        System.out.println("Sum of 2 doubles: " + calc.add(5.5, 10.5));
    }
}
    `,
    mermaid: `
classDiagram
    Shape <|-- Circle
    Shape <|-- Rectangle
    class Shape {
        +draw()
    }
    class Circle {
        +draw()
    }
    class Rectangle {
        +draw()
    }
    class Calculator {
        +add(int, int) int
        +add(int, int, int) int
        +add(double, double) double
    }
    `,
    differences: {
      headers: ['Feature', 'Method Overloading', 'Method Overriding'],
      rows: [
        ['Definition', 'Multiple methods with same name, different parameters in same class.', 'Subclass provides specific implementation for superclass method.'],
        ['Occurs In', 'Same class', 'Two classes (superclass and subclass) with inheritance.'],
        ['Parameters', 'Must be different', 'Must be same'],
        ['Return Type', 'Can be different', 'Must be same or covariant (subclass of superclass\'s return type).'],
        ['Binding', 'Compile-time (Static Polymorphism)', 'Runtime (Dynamic Polymorphism)']
      ]
    },
    tricksAndTips: `
* **"Poly" = Many, "Morph" = Forms:** Remember the root meaning. One method name, many forms/behaviors.
* **Overloading: Same Class, Different Signature:** Think of a chef having multiple recipes (methods) for "cook" based on ingredients (parameters).
* **Overriding: Parent-Child, Same Signature:** Think of a child doing something differently than a parent, but it's still the "same" action (e.g., "speak" for human vs. "speak" for dog).
* **@Override Annotation:** Always use \`@Override\` when overriding to catch errors at compile time.
    `,
    quiz: {
      question: "Which type of polymorphism is achieved through method overloading?",
      options: [
        "Runtime Polymorphism",
        "Compile-time Polymorphism",
        "Dynamic Polymorphism",
        "Inheritance Polymorphism"
      ],
      answer: "Compile-time Polymorphism"
    },
    youtubeVideos: {
      kunal: "46T2wD3IuhM", // Kunal's OOP 3 (Polymorphism starts at 1:10:26)
      striver: "lsNdT0wgNQY" // Striver's Java Polymorphism Tutorial
    },
    pyq: `
## PYQ: Differentiate between method overloading and method overriding in Java. Give an example for each.

### Answer Approach:
1.  **Define Polymorphism:** "Many forms," ability of an object to take on many forms.
2.  **Explain Method Overloading:** Same method name, different parameters. Provide \`Calculator\` example.
3.  **Explain Method Overriding:** Subclass redefines superclass method. Provide \`Shape\` hierarchy example.
4.  **Tabulate or clearly list differences:** (binding, parameters, return type, scope).
    `
  },
  abstraction: {
    title: "Abstraction",
    explanation: `
## What is Abstraction?
**Abstraction** is the concept of hiding the complex implementation details and showing only the essential features of an object. It focuses on "what" an object does rather than "how" it does it. In Java, abstraction is achieved using **abstract classes** and **interfaces**.

## Key Mechanisms:
* ### Abstract Class:
    * A class declared with the \`abstract\` keyword.
    * Can have abstract methods (methods without a body) and concrete methods (methods with a body).
    * Cannot be instantiated directly; it must be subclassed, and the subclass must provide implementations for all abstract methods.
* ### Interface:
    * A blueprint of a class.
    * Contains only abstract methods (before Java 8) and static and default methods (from Java 8 onwards).
    * All methods in an interface are implicitly \`public\` and \`abstract\` (unless default/static).
    * A class \`implements\` an interface, and must provide implementations for all its abstract methods.
    `,
    example: `
// Vehicle.java - Abstract Class
abstract class Vehicle {
    String brand;

    public Vehicle(String brand) {
        this.brand = brand;
    }

    // Abstract method (no body)
    public abstract void accelerate();

    // Concrete method
    public void displayBrand() {
        System.out.println("Brand: " + brand);
    }
}

// Car.java - Concrete class extending Abstract Vehicle
class Car extends Vehicle {
    public Car(String brand) {
        super(brand);
    }

    @Override
    public void accelerate() {
        System.out.println("Car is accelerating.");
    }
}

// Motorcycle.java - Concrete class extending Abstract Vehicle
class Motorcycle extends Vehicle {
    public Motorcycle(String brand) {
        super(brand);
    }

    @Override
    public void accelerate() {
        System.out.println("Motorcycle is accelerating.");
    }
}

// Printable.java - Interface
interface Printable {
    void print(); // Abstract method (implicitly public abstract)
}

// Document.java - Class implementing Printable interface
class Document implements Printable {
    String content;

    public Document(String content) {
        this.content = content;
    }

    @Override
    public void print() {
        System.out.println("Printing Document: " + content);
    }
}

// Main.java
public class Main {
    public static void main(String[] args) {
        // Abstract Class usage
        Vehicle myCar = new Car("Toyota");
        myCar.displayBrand();
        myCar.accelerate();

        Vehicle myMotorcycle = new Motorcycle("Harley");
        myMotorcycle.displayBrand();
        myMotorcycle.accelerate();

        // Interface usage
        Printable doc = new Document("My important report.");
        doc.print();
    }
}
    `,
    mermaid: `
classDiagram
    Vehicle <|-- Car
    Vehicle <|-- Motorcycle
    Printable <|.. Document
    abstract class Vehicle {
        +String brand
        +Vehicle(brand)
        +abstract accelerate()
        +displayBrand()
    }
    class Car {
        +Car(brand)
        +accelerate()
    }
    class Motorcycle {
        +Motorcycle(brand)
        +accelerate()
    }
    interface Printable {
        +print()
    }
    class Document {
        +String content
        +Document(content)
        +print()
    }
    `,
    differences: {
      headers: ['Feature', 'Abstract Class', 'Interface'],
      rows: [
        ['Keyword', '`abstract class`', '`interface`'],
        ['Methods', 'Can have abstract and concrete methods', 'Can have abstract, default, static methods (from Java 8).'],
        ['Variables', 'Can have instance, static, final variables', 'Only static and final variables (implicitly public static final).'],
        ['Constructors', 'Can have constructors', 'Cannot have constructors'],
        ['Inheritance', 'Extended by `extends` keyword', 'Implemented by `implements` keyword'],
        ['Multiple', 'A class can extend only one abstract class', 'A class can implement multiple interfaces'],
        ['Purpose', 'Defines a common base for subclasses, providing some implementation', 'Defines a contract or a set of behaviors that a class must adhere to']
      ]
    },
    tricksAndTips: `
* **Abstract Class: Partial Blueprint:** Think of an abstract class as a blueprint that's not quite finished. It has some common parts, but some sections are left blank for specific builders (subclasses) to fill in.
* **Interface: Contract/Capability:** An interface is like a contract. If a class signs this contract (implements the interface), it *must* provide all the behaviors (methods) specified in the contract. It's about what a class *can do*.
* **"What" vs. "How":** Abstraction is about defining "what" needs to be done (e.g., a Vehicle can <code>accelerate()</code>) without specifying "how" (a Car accelerates differently than a Motorcycle).
    `,
    quiz: {
      question: "Which of the following cannot be instantiated directly in Java?",
      options: [
        "A concrete class",
        "An interface",
        "An abstract class",
        "Both an interface and an abstract class"
      ],
      answer: "Both an interface and an abstract class"
    },
    youtubeVideos: {
      kunal: "r_MIE1K53c8", // Kunal's OOP 5: Abstract Classes, Interfaces, Annotations
      striver: "PM47JJe_8xI" // Apna College: Java OOPs in One Shot (covers abstraction as part of OOP)
    },
    pyq: `
## PYQ: When would you use an abstract class versus an interface in Java? Explain with examples.

### Answer Approach:
1.  **Define Abstraction:** Hiding implementation details, focusing on "what" not "how."
2.  **Explain Abstract Class:** Use when you have a common base class with some shared implementation and some methods that must be implemented by subclasses (e.g., \`Vehicle\` with \`accelerate\` and \`displayBrand\`).
3.  **Explain Interface:** Use when you want to define a contract or a set of behaviors that unrelated classes can implement (e.g., \`Printable\` interface for \`Document\`, \`Report\`, etc.).
4.  **Clearly list the key differences:** (constructors, multiple inheritance, default methods, etc.) to justify choice.
    `
  }
};

function App() {
  const [selectedTopic, setSelectedTopic] = useState('intro');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-900 antialiased">
      <div className="container mx-auto p-6 lg:p-10">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-indigo-800 drop-shadow-lg mb-4">
            Java OOP Learning Hub
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Explore the core concepts of Object-Oriented Programming in Java.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="lg:w-1/4 bg-white p-6 rounded-2xl shadow-xl border border-blue-200">
            <h2 className="text-2xl font-bold mb-6 text-indigo-700">Topics</h2>
            <ul className="space-y-3">
              {Object.keys(oopContent).map((key) => (
                <li key={key}>
                  <button
                    onClick={() => setSelectedTopic(key)}
                    className={`w-full text-left py-3 px-4 rounded-xl transition-all duration-300 ease-in-out
                      ${selectedTopic === key
                        ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                        : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 hover:text-indigo-900'
                      }
                      font-medium text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75`}
                  >
                    {oopContent[key].title.split(':')[0]}
                  </button>
                </li>
              ))}
              {/* Add Glossary to sidebar */}
              <li>
                <button
                  onClick={() => setSelectedTopic('glossary')}
                  className={`w-full text-left py-3 px-4 rounded-xl transition-all duration-300 ease-in-out
                    ${selectedTopic === 'glossary'
                      ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                      : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 hover:text-indigo-900'
                    }
                    font-medium text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75`}
                >
                  OOP Glossary
                </button>
              </li>
            </ul>
          </nav>

          {/* Main Content Area */}
          <main className="lg:w-3/4 bg-white p-8 rounded-2xl shadow-xl border border-blue-200">
            {selectedTopic && oopContent[selectedTopic] && (
              <div className="space-y-8">
                <h2 className="text-4xl font-bold text-indigo-800 mb-6 border-b-4 border-indigo-400 pb-2">
                  {oopContent[selectedTopic].title}
                </h2>

                {/* Explanation */}
                <section className="bg-blue-50 p-6 rounded-xl shadow-inner">
                  <h3 className="text-2xl font-semibold mb-3 text-indigo-700">Explanation</h3>
                  <MarkdownRenderer content={oopContent[selectedTopic].explanation} />
                </section>

                {/* Simple Example */}
                <section className="bg-green-50 p-6 rounded-xl shadow-inner">
                  <h3 className="text-2xl font-semibold mb-3 text-green-700">Simple Java Example</h3>
                  <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-sm leading-relaxed">
                    <code>{oopContent[selectedTopic].example.trim()}</code>
                  </pre>
                </section>

                {/* Mermaid Diagram */}
                <Mermaid chart={oopContent[selectedTopic].mermaid} />

                {/* Tricks and Tips */}
                {oopContent[selectedTopic].tricksAndTips && (
                  <section className="bg-teal-50 p-6 rounded-xl shadow-inner">
                    <h3 className="text-2xl font-semibold mb-3 text-teal-700">Tricks & Tips to Remember</h3>
                    <MarkdownRenderer content={oopContent[selectedTopic].tricksAndTips} />
                  </section>
                )}

                {/* Differences */}
                {oopContent[selectedTopic].differences && (
                  <section className="bg-yellow-50 p-6 rounded-xl shadow-inner">
                    <h3 className="text-2xl font-semibold mb-3 text-yellow-700">Key Differences</h3>
                    {/* Render the DifferencesTable component */}
                    <DifferencesTable
                      headers={oopContent[selectedTopic].differences.headers}
                      rows={oopContent[selectedTopic].differences.rows}
                    />
                  </section>
                )}

                {/* Quick Check Quiz */}
                {oopContent[selectedTopic].quiz && (
                  <Quiz
                    question={oopContent[selectedTopic].quiz.question}
                    options={oopContent[selectedTopic].quiz.options}
                    answer={oopContent[selectedTopic].quiz.answer}
                  />
                )}

                {/* YouTube Videos */}
                {oopContent[selectedTopic].youtubeVideos && (
                  <VideoSlider
                    kunalVideoId={oopContent[selectedTopic].youtubeVideos.kunal}
                    striverVideoId={oopContent[selectedTopic].youtubeVideos.striver}
                  />
                )}

                {/* PYQs */}
                {oopContent[selectedTopic].pyq && (
                  <section className="bg-purple-50 p-6 rounded-xl shadow-inner">
                    <h3 className="text-2xl font-semibold mb-3 text-purple-700">PYQ (Previous Year Question)</h3>
                    <MarkdownRenderer content={oopContent[selectedTopic].pyq} />
                  </section>
                )}

                {/* Further Reading/Resources Placeholder */}
                <section className="bg-gray-50 p-6 rounded-xl shadow-inner">
                  <h3 className="text-2xl font-semibold mb-3 text-gray-700">Further Reading & Resources</h3>
                  <p className="text-gray-800">
                    To deepen your understanding, consider exploring official Java documentation, online tutorials, and practice coding challenges. Consistent practice is key!
                  </p>
                </section>
              </div>
            )}
            {selectedTopic === 'glossary' && (
              <div className="space-y-8">
                <h2 className="text-4xl font-bold text-indigo-800 mb-6 border-b-4 border-indigo-400 pb-2">
                  {glossaryContent.title}
                </h2>
                <section className="bg-gray-50 p-6 rounded-xl shadow-inner">
                  <h3 className="text-2xl font-semibold mb-3 text-gray-700">Key Terms & Definitions</h3>
                  <dl className="space-y-4">
                    {glossaryContent.terms.map((item, index) => (
                      <div key={index}>
                        <dt className="font-bold text-lg text-gray-900">{item.term}</dt>
                        <dd className="ml-4 text-gray-800">{item.definition}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </div>
            )}
          </main>
        </div>

        <footer className="text-center text-gray-600 mt-10 text-sm">
          <p>&copy; {new Date().getFullYear()} Java OOP Learner. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
