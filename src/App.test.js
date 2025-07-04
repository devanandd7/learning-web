import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders OOP Glossary title', () => {
  render(<App />);
  const glossaryTitle = screen.getByText(/OOP Glossary/i);
  expect(glossaryTitle).toBeInTheDocument();
});

test('renders at least one glossary term', () => {
  render(<App />);
  const term = screen.getByText(/Class/i);
  expect(term).toBeInTheDocument();
});

test('renders Encapsulation definition', () => {
  render(<App />);
  const definition = screen.getByText(/Bundling data and methods that operate on the data/i);
  expect(definition).toBeInTheDocument();
});

test('renders Object definition', () => {
  render(<App />);
  const definition = screen.getByText(/An instance of a class; a concrete entity created from a class blueprint that occupies memory/i);
  expect(definition).toBeInTheDocument();
});

test('renders Inheritance definition', () => {
  render(<App />);
  const definition = screen.getByText(/A mechanism where one class \(subclass\) acquires properties and behaviors from another class \(superclass\)/i);
  expect(definition).toBeInTheDocument();
});

test('renders Polymorphism definition', () => {
  render(<App />);
  const definition = screen.getByText(/Meaning 'many forms', it allows objects of different classes to be treated as objects of a common type/i);
  expect(definition).toBeInTheDocument();
});

test('renders Abstraction definition', () => {
  render(<App />);
  const definition = screen.getByText(/Hiding complex implementation details and showing only essential features/i);
  expect(definition).toBeInTheDocument();
});

test('renders Constructor definition', () => {
  render(<App />);
  const definition = screen.getByText(/A special method used to initialize objects when they are created/i);
  expect(definition).toBeInTheDocument();
});

test('renders Method Overloading definition', () => {
  render(<App />);
  const definition = screen.getByText(/Defining multiple methods in the same class with the same name but different parameters/i);
  expect(definition).toBeInTheDocument();
});

test('renders Method Overriding definition', () => {
  render(<App />);
  const definition = screen.getByText(/A subclass providing a specific implementation for a method already defined in its superclass/i);
  expect(definition).toBeInTheDocument();
});

test('renders Superclass definition', () => {
  render(<App />);
  const definition = screen.getByText(/The parent class whose properties and methods are inherited/i);
  expect(definition).toBeInTheDocument();
});

test('renders Subclass definition', () => {
  render(<App />);
  const definition = screen.getByText(/The child class that inherits properties and methods from a superclass/i);
  expect(definition).toBeInTheDocument();
});

test('renders Access Modifier definition', () => {
  render(<App />);
  const definition = screen.getByText(/Keywords \(e\.g\., `public`, `private`, `protected`\) that set the accessibility level/i);
  expect(definition).toBeInTheDocument();
});
